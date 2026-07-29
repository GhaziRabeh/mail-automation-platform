import { prisma } from "../config/prisma";

import { emitReply } from "../socket/socket.server";

export async function markAsReplied(email: string) {
  const prospect = await prisma.prospect.findUnique({
    where: {
      email,
    },
  });

  if (!prospect) {
    console.log("Unknown sender:", email);

    return;
  }

  // Update prospect status

  await prisma.prospect.update({
    where: {
      id: prospect.id,
    },

    data: {
      status: "REPLIED",
    },
  });

  // Cancel future followups

  await prisma.followUp.updateMany({
    where: {
      prospectId: prospect.id,

      sent: false,
    },

    data: {
      sent: true,
    },
  });

  // Send realtime event to dashboard

  emitReply({
    id: prospect.id,

    company: prospect.company,

    email: prospect.email,

    status: "REPLIED",

    time: new Date(),
  });

  console.log("Reply detected:", email);
}
