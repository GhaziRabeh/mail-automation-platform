import { prisma } from "../config/prisma";

import { addEmailJob } from "./email.queue.service";

export async function processFollowUps() {
  const followUps = await prisma.followUp.findMany({
    where: {
      sent: false,

      scheduledAt: {
        lte: new Date(),
      },
    },

    include: {
      prospect: true,
    },
  });

  for (const followUp of followUps) {
    const prospect = followUp.prospect;

    // Stop if replied

    if (prospect.status === "REPLIED") {
      continue;
    }

    await addEmailJob({
      email: prospect.email,

      company: prospect.company,

      reason: `Follow-up message ${followUp.step}`,

      prospectId: prospect.id,
    });

    await prisma.followUp.update({
      where: {
        id: followUp.id,
      },

      data: {
        sent: true,
      },
    });
  }
}
