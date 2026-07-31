import { Queue } from "bullmq";
import { redis } from "./config/redis";

async function main() {
  const emailQueue = new Queue("email-sending", { connection: redis });

  const counts = await emailQueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed",
    "paused"
  );

  console.log("Queue counts:", counts);

  // Show a few waiting jobs so you can see what's stuck
  const waiting = await emailQueue.getJobs(["waiting"], 0, 10);
  console.log(
    "Sample waiting jobs:",
    waiting.map((j) => ({ id: j.id, data: j.data }))
  );

  // Show failed jobs and their error reason, if any
  const failed = await emailQueue.getJobs(["failed"], 0, 10);
  console.log(
    "Sample failed jobs:",
    failed.map((j) => ({ id: j.id, data: j.data, reason: j.failedReason }))
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});