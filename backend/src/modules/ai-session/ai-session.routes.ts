import { Router } from "express";
import {
    createSessionSummaryController,
    getAISessionsController,
    getAIDashboardController,
    createAIReportAdapterController,
} from "./ai-session.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC  (للـ AI Mobile بيبعت البيانات من الموبايل)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /session-summary
 *
 * ملخص الجلسة من الـ AI Module على الموبايل.
 * بيتبعت في آخر كل جلسة (لعبة أو قسم).
 *
 * Body: CreateAISessionDTO
 * {
 *   "user_id":              "uuid",
 *   "section":              "GAMES" | "HOME" | "LEARNING" | "SKILLS" | "ROUTINE" | "PROFILE",
 *   "game":                 "memory_game" | null,
 *   "start_time":           "2026-04-13T10:00:00.000Z",
 *   "end_time":             "2026-04-13T10:05:00.000Z",
 *   "duration":             300,
 *   "focus_score":          0.78,
 *   "emotion_distribution": { "happy": 0.5, "sad": 0.1, "angry": 0.1, "neutral": 0.3 },
 *   "dominant_emotion":     "HAPPY"
 * }
 */
router.post("/session-summary", createSessionSummaryController);

// هذا المسار مخصص لاستقبال التقارير من الموديل/الفلاتر بالصيغة اللي طلبتها مبرمجة الـ AI
router.post("/api/reports", createAIReportAdapterController);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED  (للـ Parent بس)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /ai-sessions/:childId
 *
 * قائمة جلسات الطفل مع Pagination.
 * Query params: limit (default 20, max 100), offset (default 0)
 */
router.get(
    "/ai-sessions/:childId",
    requireAuth,
    requireParent,
    getAISessionsController
);

/**
 * GET /ai-sessions/:childId/dashboard
 *
 * Dashboard تحليلي كامل للـ Parent يوضح:
 * - متوسط التركيز
 * - توزيع المشاعر
 * - أكثر قسم استخدام
 * - أكثر لعبة لعبها الطفل
 * - اتجاه التركيز اليومي (آخر 7 أيام)
 */
router.get(
    "/ai-sessions/:childId/dashboard",
    requireAuth,
    requireParent,
    getAIDashboardController
);

export default router;
