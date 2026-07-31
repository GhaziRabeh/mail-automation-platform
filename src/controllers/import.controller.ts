import { Request, Response } from "express";
import fs from "fs/promises";

import { importExcel } from "../services/excel.import.service";
import { emitImport } from "../socket/socket.server";

export async function importProspects(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const result = await importExcel(req.file.path);

    await fs.unlink(req.file.path);

    // realtime notification
    emitImport(result);

    return res.json({
      message: "Import completed",

      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Import failed",

      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
