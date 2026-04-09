import { prisma } from "../../config/prisma";
import { addStarToChild } from "../learning/learning.service";

export const saveScore = async (
    childId: string,
    gameType: string,
    score: number,
    moves?: number,
    timeSpent?: number,
    completed?: boolean
) => {
    const validTypes = ["PUZZLE", "MEMORY", "TIME"];
    if (!validTypes.includes(gameType)) {
        throw Object.assign(new Error("Invalid game type"), { status: 400 });
    }

    const gameScore = await prisma.gameScore.create({
        data: { childId, gameType, score, moves, timeSpent, completed: completed || false },
    });

    // ✅ اضف نجوم لو اللعبة اتكملت
    if (completed) {
        await addStarToChild(childId, 3);
        await checkGameBadge(childId, gameType);
    }

    return { ok: true, gameScore, starsEarned: completed ? 3 : 0 };
};

export const getScores = async (childId: string, gameType?: string) => {
    return prisma.gameScore.findMany({
        where: { childId, ...(gameType ? { gameType } : {}) },
        orderBy: { playedAt: "desc" },
        take: 20,
    });
};

export const getLeaderboard = async (gameType: string) => {
    const validTypes = ["PUZZLE", "MEMORY", "TIME"];
    if (!validTypes.includes(gameType)) {
        throw Object.assign(new Error("Invalid game type"), { status: 400 });
    }

    return prisma.gameScore.findMany({
        where: { gameType, completed: true },
        orderBy: { score: "desc" },
        take: 10,
        select: {
            id: true,
            score: true,
            moves: true,
            timeSpent: true,
            playedAt: true,
            child: { select: { childProfile: { select: { name: true } } } },
        },
    });
};

const checkGameBadge = async (childId: string, gameType: string) => {
    const badgeMap: Record<string, any> = {
        MEMORY: "MEMORY_MASTER",
        PUZZLE: "PUZZLE_PRO",
    };
    const badgeType = badgeMap[gameType];
    if (!badgeType) return;

    const count = await prisma.gameScore.count({ where: { childId, gameType, completed: true } });
    if (count >= 1) {
        await prisma.badge.upsert({
            where: { childId_type: { childId, type: badgeType } },
            create: { childId, type: badgeType },
            update: {},
        });
    }
};