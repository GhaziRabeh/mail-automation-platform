import { Worker } from "bullmq";

import { redis } from "../config/redis";

import { sendEmail } from "../services/email.service";

import { prisma } from "../config/prisma";

const worker = new Worker(
  "email-sending",

  async (job) => {
    console.log("Sending:", job.data.email);

    try {
      await sendEmail({
        email: job.data.email,

        company: job.data.company,

        reason: job.data.reason,
      });

      await prisma.emailLog.updateMany({
        where: {
          prospectId: job.data.prospectId,
        },

        data: {
          status: "SENT",

          sentAt: new Date(),
        },
      });

      await prisma.prospect.update({
        where: {
          id: job.data.prospectId,
        },

        data: {
          status: "SENT",
        },
      });
    } catch (error: any) {
      await prisma.emailLog.updateMany({
        where: {
          prospectId: job.data.prospectId,
        },

        data: {
          status: "FAILED",

          error: error.message,
        },
      });

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
