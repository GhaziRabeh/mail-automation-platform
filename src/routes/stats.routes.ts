import { Router } from "express";

import { prisma } from "../config/prisma";

const router = Router();

router.get("/campaign/:id", async (req, res) => {
  const id = Number(req.params.id);

  const stats = await prisma.emailLog.groupBy({
    by: ["status"],

    where: {
      campaignId: id,
    },

    _count: true,
  });

  res.json({
    campaignId: id,

    stats,
  });
});

export default router;
