import { Router } from "express";
import { getChildProgressController, getReportsController } from "./progress.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";

const router = Router();

// للـ Parent - عشان يشوف progress الطفل
router.get("/child/:childId", requireAuth, requireParent, getChildProgressController);

// للـ Parent - عشان يشوف reports الطفل
router.get("/reports/:childId", requireAuth, requireParent, getReportsController);

export default router;