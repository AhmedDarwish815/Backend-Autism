import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { getArticles, getArticleById } from "./articles.service";

// الحصول على كل المقالات
export const getArticlesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { category, featured, limit, offset } = req.query;

        const articles = await getArticles({
            category: category as string | undefined,
            featured: featured === "true",
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
        });

        return res.json({ articles });
    } catch (err) {
        next(err);
    }
};

// الحصول على مقال واحد
export const getArticleByIdController = async (
    req: AuthRequest<{ articleId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { articleId } = req.params;
        const article = await getArticleById(articleId);
        return res.json(article);
    } catch (err) {
        next(err);
    }
};