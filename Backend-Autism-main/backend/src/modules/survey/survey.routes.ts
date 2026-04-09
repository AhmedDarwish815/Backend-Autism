import { Router } from "express";
import {
    submitSurveyController,
    getAssessmentController,
    getSurveyQuestionsController,
} from "./survey.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";
import { getSurveyStatusController } from "./survey.controller";

const router = Router();

router.get("/questions", requireAuth, requireParent, getSurveyQuestionsController);

router.post("/submit", requireAuth, requireParent, submitSurveyController);

router.get("/result/:childId", requireAuth, requireParent, getAssessmentController);
router.get(
    "/status/:childId",
    requireAuth,
    requireParent,
    getSurveyStatusController
);

export default router;
