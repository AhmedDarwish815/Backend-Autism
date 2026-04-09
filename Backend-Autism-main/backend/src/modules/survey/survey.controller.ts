import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { SURVEY_QUESTIONS } from "./survey.questions";
import {
    submitSurvey,
    getLatestAssessmentForChild,
    getSurveyStatusForChild,
} from "./survey.service";


export const submitSurveyController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const parentId = req.user!.userId;
        const { childId, answers } = req.body;

        const result = await submitSurvey(parentId, childId, answers);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const getAssessmentController = async (
    req: AuthRequest<{ childId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const parentId = req.user!.userId;
        const { childId } = req.params;

        const result = await getLatestAssessmentForChild(parentId, childId);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const getSurveyQuestionsController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        // أسئلة ثابتة
        return res.json({ questions: SURVEY_QUESTIONS });
    } catch (err) {
        next(err);
    }
};

export const getSurveyStatusController = async (
    req: AuthRequest<{ childId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const parentId = req.user!.userId;
        const { childId } = req.params;

        const result = await getSurveyStatusForChild(parentId, childId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};
