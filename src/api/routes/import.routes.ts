import { Router } from "express";

import { upload } from "../../config/upload";

import { importProspects } from "../../controllers/import.controller";

const router = Router();

router.post("/import", upload.single("file"), importProspects);

export default router;
