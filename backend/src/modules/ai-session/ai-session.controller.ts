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
