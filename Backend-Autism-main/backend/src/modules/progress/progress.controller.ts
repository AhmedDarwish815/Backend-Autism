import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { getChildProgress, getReports } from "./progress.service";

export const getChildProgressController = async (
    req: AuthRequest<{ childId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const parentId = req.user!.userId;
        const { childId } = req.params;
        const progress = await getChildProgress(parentId, childId);
        return res.json(progress);
    } catch (err) { next(err); }
};

export const getReportsController = async (
    req: AuthRequest<{ childId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const parentId = req.user!.userId;
        const { childId } = req.params;
        const reports = await getReports(parentId, childId);
        return res.json(reports);
    } catch (err) { next(err); }
};