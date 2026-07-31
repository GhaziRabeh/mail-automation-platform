import { Router } from "express";
import { prisma } from "../config/prisma";
import { launchCampaign } from "../controllers/campaign.controller";
import { startCampaign } from "../services/campaign.service";

const router = Router();

// GET /api/campaign/list — list all campaigns
router.get("/campaign/list", async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to load campaigns", error: error.message });
  }
});

// POST /api/campaign/create — create a new campaign
router.post("/campaign/create", async (req, res) => {
  try {
    const { name, subject, template } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: "name and subject are required" });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        template: template || "",
        status: "DRAFT",
      },
    });

    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create campaign", error: error.message });
  }
});

// POST /api/campaign/start-default — one click, no input required:
// reuses the most recent campaign, or auto-creates a default one, then starts it immediately.
router.post("/campaign/start-default", async (req, res) => {
  try {
    let campaign = await prisma.campaign.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
          name: "Outreach Campaign",
          subject: "Web Development & Maintenance Partnership Proposal",
          template: "",
          status: "DRAFT",
        },
      });
    }

    const result = await startCampaign(campaign.id);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/campaign/:id/start", launchCampaign);

export default router;