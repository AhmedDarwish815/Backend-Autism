import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { createAISessionSchema } from "./ai-session.dto";
import {
    saveAISession,
    getAISessionsForChild,
    getAIDashboard,
} from "./ai-session.service";

// ==========================================
// POST /session-summary
// الـ AI Mobile بيبعت الملخص هنا في آخر الجلسة
// مش محتاج Auth عشان الـ Mobile بيبعت user_id في الـ Body
// بس ممكن نضيف API Key لاحقاً
// ==========================================
export const createSessionSummaryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // ─── Validate ─────────────────────────────────────
        const parsed = createAISessionSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(422).json({
                status:  "error",
                message: "Validation failed",
                errors:  parsed.error.issues.map((issue) => ({
                    field:   issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        // ─── Save ──────────────────────────────────────────
        const session = await saveAISession(parsed.data);

        return res.status(201).json({
            status:  "success",
            message: "Session summary saved successfully",
            data:    session,
        });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// POST /api/reports
// مسار مخصص لاستقبال البيانات مباشرة من الموديل بتاع البايثون أو الفلاتر بنفس الـ Format
// ==========================================
export const createAIReportAdapterController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { child_id, game_id, report_data } = req.body;

        if (!child_id || !report_data) {
            return res.status(400).json({ error: "Missing required fields: child_id, report_data" });
        }

        // 1. حساب وقت البداية والنهاية
        const duration = report_data.duration_seconds || 60;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - duration * 1000);

        // 2. حساب نسبة التركيز من نسبة التشتت
        const distraction = report_data.distraction_percentage || 0;
        const focusScore = Math.max(0, Math.min(1, (100 - distraction) / 100)); // between 0.0 and 1.0

        // 3. تحديد الشعور الغالب
        const emotions = report_data.emotion_percentages || { happy: 0.25, sad: 0.25, angry: 0.25, neutral: 0.25 };
        let dominantEmotion = "NEUTRAL";
        let maxVal = -1;
        for (const [key, value] of Object.entries(emotions)) {
            if (typeof value === "number" && value > maxVal) {
                maxVal = value;
                dominantEmotion = key.toUpperCase();
            }
        }

        // Validate enum for dominant_emotion
        const validEmotions = ["HAPPY", "SAD", "ANGRY", "NEUTRAL"];
        if (!validEmotions.includes(dominantEmotion)) {
            dominantEmotion = "NEUTRAL";
        }

        // 4. تجهيز الـ DTO الأصلي بتاعنا
        const sessionDto = {
            user_id: child_id,
            section: "GAMES", // Default to games if game_id is sent
            game: game_id || "general_activity",
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: duration,
            focus_score: focusScore,
            emotion_distribution: emotions,
            dominant_emotion: dominantEmotion,
        };

        // 5. حفظ الجلسة باستخدام نفس الفانكشن بتاعتنا
        const parsed = createAISessionSchema.safeParse(sessionDto);
        if (!parsed.success) {
            return res.status(422).json({
                error: "Data transformation failed",
                details: parsed.error.issues,
            });
        }

        await saveAISession(parsed.data);

        return res.status(201).json({ message: "تم حفظ التقرير بنجاح في قاعدة البيانات!" });
    } catch (err) {
        console.error("AI Report Error:", err);
        return res.status(500).json({ error: "حدث خطأ أثناء الحفظ" });
    }
};

// ==========================================
// GET /ai-sessions/:childId
// للـ Parent - يشوف قائمة الجلسات بتاعة الطفل
// ==========================================
export const getAISessionsController = async (
    req: AuthRequest<{ childId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const parentId = req.user!.userId;
        const { childId } = req.params;

        // Pagination
        const limit  = Math.min(parseInt(req.query.limit  as string) || 20, 100);
        const offset = Math.max(parseInt(req.query.offset as string) || 0,  0);

        const result = await getAISessionsForChild(parentId, childId, limit, offset);

        return res.json({
            status: "success",
            data:   result,
        });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// GET /ai-sessions/:childId/dashboard
// للـ Parent - Dashboard تحليلي كامل
// ==========================================
export const getAIDashboardController = async (
    req: AuthRequest<{ childId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const parentId = req.user!.userId;
        const { childId } = req.params;

        const dashboard = await getAIDashboard(parentId, childId);

        return res.json({
            status: "success",
            data:   dashboard,
        });
    } catch (err) {
        next(err);
    }
};
