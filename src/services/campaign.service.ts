import { prisma } from "../config/prisma";

import { addEmailJob } from "./email.queue.service";

export async function startCampaign(campaignId: number) {
  // 1. Find campaign

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // 2. Get pending prospects

  const prospects = await prisma.prospect.findMany({
    where: {
      status: "PENDING",
    },
  });

  let queued = 0;

  // 3. Create jobs

  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];

    // Add email to BullMQ

    await addEmailJob({
      email: prospect.email,

      company: prospect.company,

      reason: prospect.reason,

      prospectId: prospect.id,
    });

    // Update prospect status

    await prisma.prospect.update({
      where: {
        id: prospect.id,
      },

      data: {
        status: "QUEUED",
      },
    });

    // Create email log

    await prisma.emailLog.create({
      data: {
        prospectId: prospect.id,

        campaignId: campaign.id,

        subject: campaign.subject,

        status: "PENDING",
      },
    });

    // Create follow-ups

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
  }

  // 4. Update campaign status

  await prisma.campaign.update({
    where: {
      id: campaign.id,
    },

    data: {
      status: "RUNNING",
    },
  });

  return {
    campaign: campaign.name,

    queued,
  };
}
