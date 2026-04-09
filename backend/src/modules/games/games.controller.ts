import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { saveScore, getScores, getLeaderboard } from "./games.service";

export const saveScoreController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const { gameType, score, moves, timeSpent, completed } = req.body;
        const result = await saveScore(childId, gameType, score, moves, timeSpent, completed);
        return res.status(201).json(result);
    } catch (err) { next(err); }
};

export const getScoresController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const { gameType } = req.query;
        const scores = await getScores(childId, gameType as string);
        return res.json({ scores });
    } catch (err) { next(err); }
};

export const getLeaderboardController = async (req: AuthRequest<{ gameType: string }>, res: Response, next: NextFunction) => {
    try {
        const { gameType } = req.params;
        const leaderboard = await getLeaderboard(gameType.toUpperCase());
        return res.json({ leaderboard });
    } catch (err) { next(err); }
};