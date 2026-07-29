import { emailQueue } from "../queue/email.queue";

export async function addEmailJob(data: {
  email: string;
  company: string;
  reason: string;
  prospectId: number;
}) {
  await emailQueue.add(
    "send-email",

    data,

    {
      attempts: 3,

      backoff: {
        type: "exponential",

        delay: 5000,
      },

      removeOnComplete: true,

      removeOnFail: false,
    },
  );

  console.log("Email queued:", data.email);
}
