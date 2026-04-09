import { Router } from "express";
import { saveScoreController, getScoresController, getLeaderboardController } from "./games.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.post("/score", requireAuth, saveScoreController);
router.get("/scores", requireAuth, getScoresController);
router.get("/leaderboard/:gameType", requireAuth, getLeaderboardController);

export default router;