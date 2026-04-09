import { prisma } from "../../config/prisma";

export const getRewards = async (childId: string) => {
    const reward = await prisma.reward.findUnique({ where: { childId } });
    if (!reward) return { stars: 0, totalStars: 0, level: 1, starsToNextLevel: 20 };

    const starsToNextLevel = reward.level * 20 - reward.totalStars;
    return { ...reward, starsToNextLevel: Math.max(0, starsToNextLevel) };
};

export const getBadges = async (childId: string) => {
    return prisma.badge.findMany({
        where: { childId },
        orderBy: { earnedAt: "desc" },
    });
};