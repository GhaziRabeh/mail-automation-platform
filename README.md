# Mail Automation Platform

A cold-email / outreach automation system built with **Node.js, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, and Next.js**. Runs as five independent processes.

It handles the full loop: import prospects → queue and send emails → detect replies via IMAP → schedule follow-ups → reflect it all live on a dashboard.

---

## 1. High-Level Architecture

```
                         ┌─────────────────────┐
                         │      Next.js UI      │
                         │   Dashboard :3001    │
                         └──────────┬──────────┘
                                    │ HTTP / WebSocket
                                    │
                         ┌──────────▼──────────┐
                         │     API Server      │
                         │  Express / Fastify  │
                         │        :3000        │
                         └──────────┬──────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────┐          ┌────────────────┐          ┌──────────────┐
│  PostgreSQL   │          │      Redis     │          │  Gmail IMAP  │
│   (Neon DB)   │          │  localhost:6379│          │ Mail Listener│
└──────┬───────┘          └───────┬────────┘          └──────┬───────┘
       │                          │                           │
       ▼                          ▼                           ▼
  Prisma ORM                BullMQ Queue                Reply Detection
       │                          │                           │
       └──────────────┬───────────┴──────────────┬────────────┘
                       │                          │
               ┌───────▼────────┐        ┌────────▼────────┐
               │  Email Worker  │        │ Follow-up Worker│
               │   Nodemailer   │        │    Scheduler    │
               └────────────────┘        └─────────────────┘
```

---

## 2. Project Structure

```
mail-automation/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   │
│   ├── api/
│   │   ├── server.ts
│   │   └── routes/
│   │       ├── campaign.routes.ts
│   │       ├── prospect.routes.ts
│   │       ├── stats.routes.ts
│   │       └── import.routes.ts
│   │
│   ├── config/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── mail.ts
│   │
│   ├── services/
│   │   ├── campaign.service.ts
│   │   ├── prospect.service.ts
│   │   ├── excel.import.service.ts
│   │   ├── email.queue.service.ts
│   │   ├── email.sender.service.ts
│   │   ├── followup.service.ts
│   │   └── reply.service.ts
│   │
│   ├── workers/
│   │   ├── email.worker.ts
│   │   └── followup.worker.ts
│   │
│   ├── queues/
│   │   ├── email.queue.ts
│   │   └── followup.queue.ts
│   │
│   ├── mail/
│   │   ├── imap.listener.ts
│   │   └── parser.ts
│   │
│   ├── websocket/
│   │   └── socket.ts
│   │
│   ├── test.queue.ts
│   ├── mail.server.ts
│   └── worker.server.ts
│
└── .env
```

---

## 3. Services

### API Server
Handles authentication, campaign creation, Excel lead import, campaign start, and dashboard statistics.

```
GET  /api/campaign/list           → list all campaigns
POST /api/campaign/create         → create a campaign (name + subject)
POST /api/campaign/start-default  → one-click start, no input required:
                                     reuses the most recent campaign, or
                                     auto-creates a default one, then
                                     starts it immediately
POST /api/campaign/:id/start      → start a specific campaign by id
POST /api/import                  → upload an Excel file of prospects
```

### Import Flow (auto-send on upload)

As of the current version, uploading an Excel file no longer just imports
prospects — it queues and sends an email to each newly imported prospect
immediately, using the same underlying flow as a manual campaign start.
A campaign is required for every `EmailLog` row, so the import step reuses
the most recently created campaign, or auto-creates one
(`"Auto Import Campaign"`) if none exist yet.

```
User uploads .xlsx
        │
        ▼
       API
        │
        ▼
excel.import.service.ts
        │
        ▼
For each valid, non-duplicate row:
  - create Prospect (status: PENDING)
  - queue email job          ─┐
  - Prospect → QUEUED         │  same as campaign start flow
  - create EmailLog (PENDING) │
  - schedule 2 FollowUps     ─┘
        │
        ▼
Redis Queue → Email Worker → Nodemailer → Gmail SMTP
```

### Manual Campaign Flow

Still available for re-triggering sends to any prospect that remains
`PENDING` (e.g. imported some other way, or a previous send attempt failed).

```
User clicks "Start Campaign"
        │
        ▼
       API  (POST /api/campaign/start-default)
        │
        ▼
campaign.service.ts
        │
        ▼
Find prospects (status = PENDING) not already
logged against this campaign (via EmailLog relation)
        │
        ▼
Create email jobs
        │
        ▼
Redis Queue
        │
        ▼
Email Worker
        │
        ▼
Send email
        │
        ▼
Update database
```

State transitions:
- **Prospect:** `PENDING → QUEUED → SENT` (or `FAILED` after retries are exhausted)
- **EmailLog:** `PENDING → SENT` (or `FAILED`)

### Redis + BullMQ

Jobs are stored in Redis and consumed by `email.worker.ts`.

```json
{
  "email": "company@gmail.com",
  "company": "Company Name",
  "reason": "optional note",
  "prospectId": 123
}
```

```
Queue → Worker → Nodemailer → Gmail SMTP
```

The worker resolves the prospect via `prospectId` first, falling back to a
lookup by `email` if `prospectId` is missing — this avoids a class of crash
where an incomplete job payload would otherwise throw on `Prospect.update`.

### Mail Listener (Reply Detection)

```
Gmail Inbox
     │
     ▼
imap.listener.ts
     │
     ▼
Extract sender
     │
     ▼
Search database
     │
     ▼
Prospect exists?
     │
     ▼ yes
status = REPLIED
     │
     ▼
Cancel follow-ups
     │
     ▼
Notify dashboard
```

### Real-Time Dashboard

Backend emits events over Socket.io:
- `campaign.started`
- `email.sent`
- `reply.received`

Frontend subscribes:

```ts
socket.on("reply.received", updateDashboard);
```

The dashboard's "Start Campaign" button (`StartCampaign.tsx`) requires no
input — clicking it calls `POST /api/campaign/start-default` directly.

---

## 4. Database Model

```
Campaign
 │
 ▼
Prospect
 │
 ▼
EmailLog
 │
 ▼
FollowUp
```

| Table      | Key columns                               |
|------------|--------------------------------------------|
| `Campaign` | `id`, `uuid`, `name`, `subject`, `template`, `status` |
| `Prospect` | `id`, `uuid`, `email`, `company`, `contactName`, `website`, `country`, `linkedin`, `notes`, `status` |
| `EmailLog` | `id`, `uuid`, `prospectId`, `campaignId`, `subject`, `status`, `sentAt`, `openedAt`, `repliedAt`, `error` |
| `FollowUp` | `id`, `uuid`, `prospectId`, `step`, `scheduledAt`, `sent` |

Note: `Prospect` has no direct `campaignId` column. A prospect's
relationship to a given campaign is tracked through its `EmailLog` rows
(`emailLogs.campaignId`), not a foreign key on `Prospect` itself.

---

## 5. Prerequisites

- Node.js (LTS)
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- Redis (on Windows, use **Memurai** as a local Redis-compatible service)
- A Gmail account with IMAP/SMTP access (app password recommended)

---

## 6. Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://user:password@host/dbname"
REDIS_URL="redis://localhost:6379"

GMAIL_USER="you@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

PORT=3000
```

---

## 7. Setup

### 7.1 Install Prisma

```bash
npm install prisma @prisma/client
```

### 7.2 Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="your_postgresql_connection_string"
```

Example:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 7.3 Initialize Prisma

If Prisma is not initialized:

```bash
npx prisma init
```

### 7.4 Generate Prisma Client

After updating `schema.prisma`:

```bash
npx prisma generate
```

### 7.5 Sync Database

For development:

```bash
npx prisma db push
```

For production migrations:

```bash
npx prisma migrate deploy
```

### 7.6 Open Prisma Studio

Database GUI:

```bash
npx prisma studio
```

Open: `http://localhost:5555`

---

## 8. Run Project

### Development Mode

Start API server:

```bash
npm run api
```

API runs: `http://localhost:3000`

Start background worker:

```bash
npm run worker
```

Start email listener:

```bash
npm run mail
```

Start frontend:

```bash
npm run dev
```

Frontend runs: `http://localhost:3001`

⚠️ Any time `src/routes/*.ts`, `src/services/*.ts`, or `src/workers/*.ts`
change, restart the corresponding process (`npm run api` / `npm run worker`)
— `tsx` does not hot-reload route or worker changes without an explicit
watch flag.

### Full Startup Order

```
1. PostgreSQL Database
        │
        ▼
2. Prisma Connection
        │
        ▼
3. API Server
        │
        ▼
4. Queue Worker
        │
        ▼
5. Mail Listener
        │
        ▼
6. Next.js Dashboard
```

### Available Commands

| Command               | Description               |
|------------------------|---------------------------|
| `npm run api`           | Start backend API          |
| `npm run worker`        | Start BullMQ worker        |
| `npm run mail`          | Start Gmail IMAP listener  |
| `npm run dev`           | Start Next.js dashboard    |
| `npx prisma generate`   | Generate Prisma Client     |
| `npx prisma db push`    | Update database schema     |
| `npx prisma studio`     | Open database interface    |

---

## 9. Database Management

Check Prisma schema:

```bash
npx prisma validate
```

View database:

```bash
npx prisma studio
```

Reset database (development only):

```bash
npx prisma migrate reset
```

---

## 10. Production Data Flow

```
                    User
                     │
                     ▼
                Next.js UI (:3001)
                     │
                     ▼
                API Server (:3000)
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   PostgreSQL     Redis       Gmail IMAP
        │            │            │
        ▼            ▼            ▼
    Prisma       BullMQ      Reply Engine
                     │
                     ▼
                Email Worker
                     │
                     ▼
                 Customers
```

---