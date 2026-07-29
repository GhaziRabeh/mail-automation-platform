import { Request, Response } from "express";

import { importExcel } from "../services/excel.import.service";

export async function importProspects(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const result = await importExcel(req.file.path);

    return res.json({
      message: "Import completed",

      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Import failed",
    });
  }
}
