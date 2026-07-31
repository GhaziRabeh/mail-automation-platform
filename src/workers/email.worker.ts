import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { sendEmail } from "../services/email.service";
import { prisma } from "../config/prisma";

const worker = new Worker(
  "email-sending",

  async (job) => {
    console.log("JOB RECEIVED", job.id);
    console.log("Sending:", job.data.email);

    // Guard: if prospectId is missing, DO NOT run any updateMany/update
    // that filters on it. `where: { prospectId: undefined }` is silently
    // treated by Prisma as "no filter" and will touch every row in the
    // table. Fall back to resolving the prospect via email instead.
    let prospectId: number | undefined = job.data.prospectId;

    if (!prospectId) {
      console.warn(
        `Job ${job.id} is missing prospectId. Attempting lookup by email: ${job.data.email}`,
      );

      const prospect = job.data.email
        ? await prisma.prospect.findUnique({ where: { email: job.data.email } })
        : null;

      if (prospect) {
        prospectId = prospect.id;
      } else {
        console.error(
          `Job ${job.id}: no prospect found for email ${job.data.email}. Skipping DB updates, sending email only.`,
        );
      }
    }

    try {
      await sendEmail({
        email: job.data.email,
        company: job.data.company,
        reason: job.data.reason,
      });

      if (prospectId) {
        await prisma.emailLog.updateMany({
          where: {
            prospectId, // now guaranteed to be a real number, never undefined
          },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        });

        await prisma.prospect.update({
          where: {
            id: prospectId,
          },
          data: {
            status: "SENT",
          },
        });
      }

      console.log("EMAIL SENT:", job.data.email);
    } catch (error: any) {
      console.log("EMAIL ERROR:", error.message);

      if (prospectId) {
        await prisma.emailLog.updateMany({
          where: {
            prospectId,
          },
          data: {
            status: "FAILED",
            error: error.message,
          },
        });
      }

      throw error;
    }
  },

  {
    connection: redis,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  console.log("Completed:", job.id);
});

worker.on("failed", (job, error) => {
  console.log("Failed:", job?.id, error.message);
});
