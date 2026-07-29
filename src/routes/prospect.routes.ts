import { Router } from "express";

import { upload } from "../middlewares/upload.middleware";

import { uploadProspects } from "../controllers/prospect.controller";

const router = Router();

router.post(
  "/import",

  upload.single("file"),

  uploadProspects,
);

export default router;
