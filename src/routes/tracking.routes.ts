import { Router } from "express";

import { prisma } from "../config/prisma";

const router = Router();

router.get("/open/:id", async (req, res) => {
  const id = Number(req.params.id);

  await prisma.emailLog.update({
    where: {
      id,
    },

    data: {
      openedAt: new Date(),

      status: "OPENED",
    },
  });

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ",
    "base64",
  );

  res.set("Content-Type", "image/png");

  res.send(pixel);
});

export default router;
