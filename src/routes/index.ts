import { Router } from "express";

import healthRoutes from "./health.routes";

import prospectRoutes from "./prospect.routes";

import emailRoutes from "./email.routes";

import campaignRoutes from "./campaign.routes";
import trackingRoutes from "./tracking.routes";
import statsRoutes from "./stats.routes";

const router = Router();

router.use("/health", healthRoutes);

router.use("/prospects", prospectRoutes);

router.use("/email", emailRoutes);

router.use("/campaigns", campaignRoutes);

router.use("/tracking", trackingRoutes);

router.use("/stats", statsRoutes);

export default router;
