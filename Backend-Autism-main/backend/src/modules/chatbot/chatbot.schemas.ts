import { z } from "zod";

// ==========================================
// ✅ Schema: إنشاء جلسة محادثة
// ==========================================
export const createChatSessionSchema = z.object({
    body: z.object({
        title: z.string().optional(),
    }),
});

// ==========================================
// ✅ Schema: الحصول على الجلسات
// ==========================================
export const getChatSessionsSchema = z.object({
    query: z.object({
        limit: z.string().regex(/^\d+$/).optional(),
        offset: z.string().regex(/^\d+$/).optional(),
    }),
});

// ==========================================
// ✅ Schema: الحصول على الرسائل
// ==========================================
export const getChatMessagesSchema = z.object({
    params: z.object({
        sessionId: z.string().uuid("Invalid sessionId"),
    }),
    query: z.object({
        limit: z.string().regex(/^\d+$/).optional(),
        offset: z.string().regex(/^\d+$/).optional(),
    }),
});

// ==========================================
// ✅ Schema: إرسال رسالة
// ==========================================
export const sendMessageSchema = z.object({
    params: z.object({
        sessionId: z.string().uuid("Invalid sessionId"),
    }),
    body: z.object({
        content: z.string().min(1, "Message content is required").max(2000, "Message is too long"),
    }),
    });

    // ==========================================
    // ✅ Schema: حذف جلسة
    // ==========================================
    export const deleteChatSessionSchema = z.object({
    params: z.object({
        sessionId: z.string().uuid("Invalid sessionId"),
    }),
});