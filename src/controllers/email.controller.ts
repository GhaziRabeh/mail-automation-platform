import { Request, Response } from "express";

import { sendEmail } from "../services/email.service";

export async function testEmail(req: Request, res: Response) {
  try {
    const result = await sendEmail({
      email: req.body.email,

      company: req.body.company,

      reason: req.body.reason,
    });

    res.json({
      success: true,

      message: "Email sent",

      id: result.messageId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      error,
    });
  }
}
