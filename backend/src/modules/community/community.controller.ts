import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import {
    createPost,
    getPosts,
    getPostById,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    getComments,
    savePost,
    unsavePost,
} from "./community.service";

// ==========================================
// ✅ Controller: إنشاء منشور جديد
// ==========================================
export const createPostController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { content, imageUrl } = req.body;

        const post = await createPost(userId, content, imageUrl);
        return res.status(201).json(post);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: الحصول على المنشورات
// ==========================================
export const getPostsController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { sort, savedOnly, limit, offset } = req.query;

        const filters = {
        sort: sort as "latest" | "most_liked" | undefined,
        savedOnly: savedOnly === "true",
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        };

        const posts = await getPosts(userId, filters);
        return res.json({ posts });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: الحصول على منشور واحد
// ==========================================
export const getPostByIdController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const post = await getPostById(postId, userId);
        return res.json(post);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: حذف منشور
// ==========================================
export const deletePostController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await deletePost(postId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: إعجاب بمنشور
// ==========================================
export const likePostController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await likePost(postId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: إلغاء الإعجاب
// ==========================================
export const unlikePostController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await unlikePost(postId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: إضافة تعليق
// ==========================================
export const addCommentController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;
        const { content } = req.body;

        const comment = await addComment(postId, userId, content);
        return res.status(201).json(comment);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: الحصول على التعليقات
// ==========================================
export const getCommentsController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const { postId } = req.params;
        const { limit, offset } = req.query;

        const comments = await getComments(
        postId,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
        );

        return res.json({ comments });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: حفظ منشور
// ==========================================
export const savePostController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await savePost(postId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: إلغاء الحفظ
// ==========================================
export const unsavePostController = async (
    req: AuthRequest<{ postId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await unsavePost(postId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};