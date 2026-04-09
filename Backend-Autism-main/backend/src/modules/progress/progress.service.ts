import { prisma } from "../../config/prisma";

const ensureParentOwnsChild = async (parentId: string, childId: string) => {
    const child = await prisma.user.findFirst({
        where: { id: childId, parentId, role: "CHILD" },
        select: { id: true },
    });
    if (!child) throw Object.assign(new Error("Child not found"), { status: 404 });
};

// ==========================================
// Get child progress (للـ Parent)
// ==========================================
export const getChildProgress = async (parentId: string, childId: string) => {
    await ensureParentOwnsChild(parentId, childId);

    const [reward, badges, learningCount, gameScores, routineLogs] = await Promise.all([
        prisma.reward.findUnique({ where: { childId } }),
        prisma.badge.findMany({ where: { childId }, orderBy: { earnedAt: "desc" } }),
        prisma.learningLog.count({ where: { childId } }),
        prisma.gameScore.findMany({ where: { childId, completed: true }, orderBy: { playedAt: "desc" }, take: 5 }),
        prisma.routineLog.count({ where: { childId, status: "COMPLETED" } }),
    ]);

    const latestAssessment = await prisma.assessmentResult.findFirst({
        where: { surveyResponse: { childId } },
        orderBy: { createdAt: "desc" },
        select: { probability: true, riskLevel: true, summary: true, createdAt: true },
    });

    return {
        stars: reward?.stars || 0,
        totalStars: reward?.totalStars || 0,
        level: reward?.level || 1,
        badges,
        learningItemsViewed: learningCount,
        gamesCompleted: gameScores.length,
        routineTasksCompleted: routineLogs,
        latestAssessment,
        overallProgress: Math.min(100, Math.round(
            (learningCount * 0.3 + gameScores.length * 5 + routineLogs * 2)
        )),
    };
};

// ==========================================
// Get reports (للـ Parent)
// ==========================================
export const getReports = async (parentId: string, childId: string) => {
    await ensureParentOwnsChild(parentId, childId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
        todayCompleted,
        todayTotal,
        weeklyRoutine,
        weeklyGames,
        weeklyLearning,
    ] = await Promise.all([
        prisma.routineLog.count({ where: { childId, date: today, status: "COMPLETED" } }),
        prisma.routineTask.count(),
        prisma.routineLog.findMany({
            where: { childId, date: { gte: weekAgo }, status: "COMPLETED" },
            select: { date: true },
        }),
        prisma.gameScore.findMany({
            where: { childId, playedAt: { gte: weekAgo }, completed: true },
            select: { playedAt: true, gameType: true, score: true },
        }),
        prisma.learningLog.count({ where: { childId, viewedAt: { gte: weekAgo } } }),
    ]);

    const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // بناء الـ weekly chart
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekAgo);
        date.setDate(date.getDate() + i + 1);
        const dateStr = date.toISOString().split("T")[0];
        const completed = weeklyRoutine.filter(
            (r) => r.date.toISOString().split("T")[0] === dateStr
        ).length;
        return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: dateStr,
            completed,
            percentage: todayTotal > 0 ? Math.round((completed / todayTotal) * 100) : 0,
        };
    });

    return {
        today: {
            completed: todayCompleted,
            total: todayTotal,
            percentage: todayPercentage,
        },
        weeklyChart,
        weeklyGames,
        weeklyLearning,
    };
};