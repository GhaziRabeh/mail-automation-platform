import { Request, Response } from "express";

import { importProspects } from "../services/prospect.service";

export async function uploadProspects(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Excel file required",
      });
    }

    const result = await importProspects(req.file.path);

    res.json({
      success: true,

      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: "Import failed",

      error,
    });
  }
}
