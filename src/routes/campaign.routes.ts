import { Router } from "express";

import { launchCampaign } from "../controllers/campaign.controller";

const router = Router();

router.post(
  "/:id/start",

  launchCampaign,
);

export default router;
