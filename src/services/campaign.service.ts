import { prisma } from "../config/prisma";
import { addEmailJob } from "./email.queue.service";

export async function startCampaign(campaignId: number) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }


  const prospects = await prisma.prospect.findMany({
    where: {
      status: "PENDING",
      emailLogs: {
        none: {
          campaignId: campaign.id,
        },
      },
    },
  });

  console.log("Pending prospects:", prospects.length);

  let queued = 0;
  let failed = 0;
  const errors: { prospectId: number; email: string; error: string }[] = [];

  for (const prospect of prospects) {
    try {
      console.log("Queueing:", prospect.email);

      await addEmailJob({
        email: prospect.email,
        company: prospect.company,
        reason: prospect.notes ?? "",
        prospectId: prospect.id,
      });

      await prisma.prospect.update({
        where: {
          id: prospect.id,
        },
        data: {
          status: "QUEUED",
        },
      });

      await prisma.emailLog.create({
        data: {
          prospectId: prospect.id,
          campaignId: campaign.id,
          subject: campaign.subject,
          status: "PENDING",
        },
      });

      await prisma.followUp.createMany({
        data: [
          {
            prospectId: prospect.id,
            step: 1,
            scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          {
            prospectId: prospect.id,
            step: 2,
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      queued++;
    } catch (error: any) {
      failed++;
      errors.push({
        prospectId: prospect.id,
        email: prospect.email,
        error: error?.message ?? "Unknown error",
      });
      console.error(`Failed to queue prospect ${prospect.email}:`, error);
    }
  }

  if (queued > 0) {
    await prisma.campaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        status: "RUNNING",
      },
    });
  }

  return {
    campaign: campaign.name,
    queued,
    failed,
    total: prospects.length,
    errors,
  };
}
