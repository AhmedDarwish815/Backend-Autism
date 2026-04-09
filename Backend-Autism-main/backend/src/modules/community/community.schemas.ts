import { z } from "zod";

// ==========================================
// ✅ Schema: إنشاء منشور
// ==========================================
export const createPostSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Content is required").max(5000, "Content is too long"),
        imageUrl: z.string().url().optional(),
    }),
});

// ==========================================
// ✅ Schema: الحصول على المنشورات
// ==========================================
export const getPostsSchema = z.object({
    query: z.object({
        sort: z.enum(["latest", "most_liked"]).optional(),
        savedOnly: z.string().optional(), // "true" or "false"
        limit: z.string().regex(/^\d+$/).optional(),
        offset: z.string().regex(/^\d+$/).optional(),
    }),
});

// ==========================================
// ✅ Schema: الحصول على منشور واحد
// ==========================================
export const getPostByIdSchema = z.object({
    params: z.object({
        postId: z.string().uuid("Invalid postId"),
    }),
});

// ==========================================
// ✅ Schema: حذف منشور
// ==========================================
export const deletePostSchema = z.object({
    params: z.object({
        postId: z.string().uuid("Invalid postId"),
    }),
});

// ==========================================
// ✅ Schema: إعجاب/إلغاء إعجاب
// ==========================================
export const likePostSchema = z.object({
    params: z.object({
        postId: z.string().uuid("Invalid postId"),
    }),
});

// ==========================================
// ✅ Schema: إضافة تعليق
// ==========================================
export const addCommentSchema = z.object({
    params: z.object({
        postId: z.string().uuid("Invalid postId"),
    }),
    body: z.object({
        content: z.string().min(1, "Content is required").max(1000, "Content is too long"),
    }),
});

// ==========================================
// ✅ Schema: الحصول على التعليقات
// ==========================================
export const getCommentsSchema = z.object({
    params: z.object({
        postId: z.string().uuid("Invalid postId"),
    }),
    query: z.object({
        limit: z.string().regex(/^\d+$/).optional(),
        offset: z.string().regex(/^\d+$/).optional(),
    }),
});

// ==========================================
// ✅ Schema: حفظ/إلغاء حفظ
// ==========================================
export const savePostSchema = z.object({
    params: z.object({
        postId: z.string().uuid("Invalid postId"),
    }),
});