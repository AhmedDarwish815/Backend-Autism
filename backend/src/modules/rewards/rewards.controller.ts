import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { getRewards, getBadges } from "./rewards.service";

export const getRewardsController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const rewards = await getRewards(childId);
        return res.json(rewards);
    } catch (err) { next(err); }
};

export const getBadgesController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const badges = await getBadges(childId);
        return res.json({ badges });
    } catch (err) { next(err); }
};