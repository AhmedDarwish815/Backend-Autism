import { Router } from "express";
import {
    createPostController,
    getPostsController,
    getPostByIdController,
    deletePostController,
    likePostController,
    unlikePostController,
    addCommentController,
    getCommentsController,
    savePostController,
    unsavePostController,
} from "./community.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";
import { validate } from "../../utils/validate";
import {
    createPostSchema,
    getPostsSchema,
    getPostByIdSchema,
    deletePostSchema,
    likePostSchema,
    addCommentSchema,
    getCommentsSchema,
    savePostSchema,
} from "./community.schemas";

const router = Router();

// ==========================================
// ✅ Posts Routes
// ==========================================

// الحصول على المنشورات (Latest, Most Liked, Saved)
router.get(
    "/posts",
    requireAuth,
    requireParent,
    validate(getPostsSchema),
    getPostsController
);

// إنشاء منشور جديد
router.post(
    "/posts",
    requireAuth,
    requireParent,
    validate(createPostSchema),
    createPostController
);

// الحصول على منشور واحد
router.get(
    "/posts/:postId",
    requireAuth,
    requireParent,
    validate(getPostByIdSchema),
    getPostByIdController
);

// حذف منشور
router.delete(
    "/posts/:postId",
    requireAuth,
    requireParent,
    validate(deletePostSchema),
    deletePostController
);

// ==========================================
// ✅ Likes Routes
// ==========================================

// إعجاب بمنشور
router.post(
    "/posts/:postId/like",
    requireAuth,
    requireParent,
    validate(likePostSchema),
    likePostController
);

// إلغاء الإعجاب
router.delete(
    "/posts/:postId/like",
    requireAuth,
    requireParent,
    validate(likePostSchema),
    unlikePostController
);

// ==========================================
// ✅ Comments Routes
// ==========================================

// الحصول على التعليقات
router.get(
    "/posts/:postId/comments",
    requireAuth,
    requireParent,
    validate(getCommentsSchema),
    getCommentsController
);

// إضافة تعليق
router.post(
    "/posts/:postId/comments",
    requireAuth,
    requireParent,
    validate(addCommentSchema),
    addCommentController
);

// ==========================================
// ✅ Save Routes
// ==========================================

// حفظ منشور
router.post(
    "/posts/:postId/save",
    requireAuth,
    requireParent,
    validate(savePostSchema),
    savePostController
);

// إلغاء الحفظ
router.delete(
    "/posts/:postId/save",
    requireAuth,
    requireParent,
    validate(savePostSchema),
    unsavePostController
);

export default router;