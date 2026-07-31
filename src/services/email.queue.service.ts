import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email-sending", {
  connection: redis,
});

export async function addEmailJob(data: {
  email: string;
  company: string;
  reason?: string;
  prospectId: number;
}) {
  console.log("Adding email job:", data.email);

  const job = await emailQueue.add("send-email", data, {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });

  console.log("Job created:", job.id);

  return job;
}
