import { Router } from "express";

import { prisma } from "../config/prisma";
import { upload } from "../config/upload";
import { importProspects } from "../controllers/import.controller";

const router = Router();

router.get("/prospects", async (req, res) => {
  const prospects = await prisma.prospect.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(prospects);
});

router.get("/stats", async (req, res) => {
  const total = await prisma.prospect.count();

  const replied = await prisma.prospect.count({
    where: {
      status: "REPLIED",
    },
  });

  const sent = await prisma.prospect.count({
    where: {
      status: "SENT",
    },
  });

  res.json({
    total,
    sent,
    replied,
  });
});

// Excel Import

router.post("/import", upload.single("file"), importProspects);

export default router;
