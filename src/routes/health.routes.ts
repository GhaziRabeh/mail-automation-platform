import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",

    service: "Mail Automation API",

    timestamp: new Date(),
  });
});

export default router;
