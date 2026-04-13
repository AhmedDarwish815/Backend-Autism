import { prisma } from "../../config/prisma";
import { CreateAISessionDTO } from "./ai-session.dto";
import { AppSection, DominantEmotion } from "@prisma/client";

// ==========================================
// Save AI Session Summary
// اللي الـ AI Mobile بيبعته في آخر كل جلسة
// ==========================================
export const saveAISession = async (dto: CreateAISessionDTO) => {
    // ✅ تأكد إن الـ user_id موجود وهو child
    const child = await prisma.user.findFirst({
        where: { id: dto.user_id, role: "CHILD" },
        select: { id: true },
    });

    if (!child) {
        throw Object.assign(new Error("Child user not found"), { status: 404 });
    }

    // ✅ تحويل الـ section string إلى Prisma Enum
    const section = dto.section as AppSection;
    const dominantEmotion = dto.dominant_emotion as DominantEmotion;

    const session = await prisma.aISession.create({
        data: {
            childId:            dto.user_id,
            section,
            game:               dto.game ?? null,
            startTime:          new Date(dto.start_time),
            endTime:            new Date(dto.end_time),
            duration:           dto.duration,
            focusScore:         dto.focus_score,
            emotionDistribution: dto.emotion_distribution,
            dominantEmotion,
        },
    });

    return {
        id:               session.id,
        childId:          session.childId,
        section:          session.section,
        game:             session.game,
        startTime:        session.startTime,
        endTime:          session.endTime,
        duration:         session.duration,
        focusScore:       session.focusScore,
        dominantEmotion:  session.dominantEmotion,
        createdAt:        session.createdAt,
    };
};

// ==========================================
// Get AI Sessions for a Child (للـ Dashboard)
// ==========================================
export const getAISessionsForChild = async (
    parentId: string,
    childId:  string,
    limit = 20,
    offset = 0
) => {
    // ✅ تأكد إن الـ parent هو أبو الـ child ده
    const child = await prisma.user.findFirst({
        where: { id: childId, parentId, role: "CHILD" },
        select: { id: true },
    });

    if (!child) {
        throw Object.assign(new Error("Child not found or not yours"), { status: 404 });
    }

    const [sessions, total] = await Promise.all([
        prisma.aISession.findMany({
            where:   { childId },
            orderBy: { createdAt: "desc" },
            skip:    offset,
            take:    limit,
        }),
        prisma.aISession.count({ where: { childId } }),
    ]);

    return { sessions, total, limit, offset };
};

// ==========================================
// Get AI Dashboard Summary (للـ Parent)
// تجميع كل البيانات وتحليلها
// ==========================================
export const getAIDashboard = async (parentId: string, childId: string) => {
    // ✅ تأكد إن الـ parent هو أبو الـ child ده
    const child = await prisma.user.findFirst({
        where: { id: childId, parentId, role: "CHILD" },
        select: { id: true },
    });

    if (!child) {
        throw Object.assign(new Error("Child not found or not yours"), { status: 404 });
    }

    // آخر 30 يوم
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.aISession.findMany({
        where:   { childId, createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "asc" },
    });

    if (sessions.length === 0) {
        return {
            totalSessions:       0,
            totalDurationSeconds: 0,
            averageFocusScore:   0,
            emotionBreakdown:    { happy: 0, sad: 0, angry: 0, neutral: 0 },
            dominantEmotionOverall: null,
            mostUsedSection:     null,
            mostPlayedGame:      null,
            focusTrend:          [],
            sectionBreakdown:    [],
        };
    }

    // ─── متوسط التركيز ───────────────────────────────────
    const avgFocus =
        sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length;

    // ─── مجموع المدة ─────────────────────────────────────
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

    // ─── توزيع المشاعر الإجمالي ──────────────────────────
    const emotionAgg = { happy: 0, sad: 0, angry: 0, neutral: 0 };

    for (const s of sessions) {
        const dist = s.emotionDistribution as Record<string, number>;
        emotionAgg.happy   += dist.happy   ?? 0;
        emotionAgg.sad     += dist.sad     ?? 0;
        emotionAgg.angry   += dist.angry   ?? 0;
        emotionAgg.neutral += dist.neutral ?? 0;
    }

    const emotionTotal = Object.values(emotionAgg).reduce((a, b) => a + b, 0);
    const emotionBreakdown = {
        happy:   parseFloat((emotionAgg.happy   / emotionTotal).toFixed(3)),
        sad:     parseFloat((emotionAgg.sad     / emotionTotal).toFixed(3)),
        angry:   parseFloat((emotionAgg.angry   / emotionTotal).toFixed(3)),
        neutral: parseFloat((emotionAgg.neutral / emotionTotal).toFixed(3)),
    };

    // ─── المشاعر الغالبة الإجمالية ─────────────────────────
    const dominantEmotionOverall = (
        Object.entries(emotionBreakdown) as [string, number][]
    ).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    // ─── أكثر قسم استخدام ──────────────────────────────────
    const sectionCounts: Record<string, number> = {};
    for (const s of sessions) {
        sectionCounts[s.section] = (sectionCounts[s.section] ?? 0) + 1;
    }
    const sectionBreakdown = Object.entries(sectionCounts)
        .map(([section, count]) => ({ section, count }))
        .sort((a, b) => b.count - a.count);

    const mostUsedSection = sectionBreakdown[0]?.section ?? null;

    // ─── أكثر لعبة لعبها ───────────────────────────────────
    const gameCounts: Record<string, number> = {};
    for (const s of sessions) {
        if (s.game) {
            gameCounts[s.game] = (gameCounts[s.game] ?? 0) + 1;
        }
    }
    const mostPlayedGame =
        Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // ─── اتجاه التركيز يومياً (آخر 7 أيام) ────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = sessions.filter(
        (s) => s.createdAt >= sevenDaysAgo
    );

    const dailyFocus: Record<string, { total: number; count: number }> = {};
    for (const s of recentSessions) {
        const day = s.createdAt.toISOString().split("T")[0];
        if (!dailyFocus[day]) dailyFocus[day] = { total: 0, count: 0 };
        dailyFocus[day].total += s.focusScore;
        dailyFocus[day].count += 1;
    }

    const focusTrend = Object.entries(dailyFocus)
        .map(([date, { total, count }]) => ({
            date,
            avgFocusScore: parseFloat((total / count).toFixed(3)),
            sessionCount:  count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalSessions:          sessions.length,
        totalDurationSeconds:   totalDuration,
        averageFocusScore:      parseFloat(avgFocus.toFixed(3)),
        emotionBreakdown,
        dominantEmotionOverall,
        mostUsedSection,
        mostPlayedGame,
        focusTrend,
        sectionBreakdown,
    };
};
