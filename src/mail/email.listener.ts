import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { markAsReplied } from "../services/reply.service";

const client = new ImapFlow({
  host: process.env.MAIL_HOST!,

  port: Number(process.env.MAIL_PORT),

  secure: true,

  auth: {
    user: process.env.EMAIL!,
    pass: process.env.APP_PASSWORD!.replaceAll(" ", ""),
  },
});

export async function startEmailListener() {
  await client.connect();

  const lock = await client.getMailboxLock("INBOX");

  try {
    await client.mailboxOpen("INBOX");

    for await (const message of client.fetch(
      {
        seen: false,
      },
      {
        envelope: true,
        source: true,
      },
    )) {
      // protect undefined source
      if (!message.source) {
        console.log("No source found");
        continue;
      }

      const parsed = await simpleParser(message.source);

      const from = parsed.from?.value[0]?.address;

      console.log("Incoming mail from:", from);

      if (from) {
        await markAsReplied(from);
      }
    }
  } finally {
    lock.release();

    await client.logout();
  }
}
