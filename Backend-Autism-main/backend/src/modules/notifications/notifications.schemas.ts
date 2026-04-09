import { z } from "zod";

// ==========================================
// ✅ Schema: الحصول على الإشعارات
// ==========================================
export const getNotificationsSchema = z.object({
    query: z.object({
        unreadOnly: z.string().optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        offset: z.string().regex(/^\d+$/).optional(),
    }),
});

// ==========================================
// ✅ Schema: تعليم إشعار كمقروء
// ==========================================
export const markAsReadSchema = z.object({
    params: z.object({
        notificationId: z.string().uuid("Invalid notificationId"),
    }),
});

// ==========================================
// ✅ Schema: حذف إشعار
// ==========================================
export const deleteNotificationSchema = z.object({
    params: z.object({
        notificationId: z.string().uuid("Invalid notificationId"),
    }),
});

// ==========================================
// ✅ Schema: إنشاء إشعار تجريبي
// ==========================================
export const createTestNotificationSchema = z.object({
    body: z.object({
        type: z.enum([
        "SURVEY_REMINDER",
        "ACTIVITY_REMINDER",
        "NEW_POST",
        "NEW_COMMENT",
        "PROGRESS_UPDATE",
        "SYSTEM",
        ]),
        title: z.string().min(1, "Title is required"),
        message: z.string().min(1, "Message is required"),
    }),
});