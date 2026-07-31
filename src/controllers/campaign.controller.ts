import { Request, Response } from "express";
import { startCampaign } from "../services/campaign.service";

export async function launchCampaign(req: Request, res: Response) {
  try {
    const campaignId = Number(req.params.id);

    const result = await startCampaign(campaignId);

    return res.json({
      success: true,

      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
}
