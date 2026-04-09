import { Router } from "express";
import { getRewardsController, getBadgesController } from "./rewards.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.get("/", requireAuth, getRewardsController);
router.get("/badges", requireAuth, getBadgesController);

export default router;