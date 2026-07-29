import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(err.message);

  res.status(500).json({
    success: false,

    message: "Internal Server Error",

    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
