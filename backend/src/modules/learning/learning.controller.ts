import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import {
    getCategories,
    getItemsByCategory,
    getItemById,
    logLearning,
} from "./learning.service";

// ==========================================
// Get all categories
// ==========================================
export const getCategoriesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await getCategories();
        return res.json({ categories });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// Get items by category
// ==========================================
export const getItemsByCategoryController = async (
    req: AuthRequest<{ category: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { category } = req.params;
        const items = await getItemsByCategory(category.toUpperCase());
        return res.json({ category, items });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// Get single item
// ==========================================
export const getItemByIdController = async (
    req: AuthRequest<{ itemId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { itemId } = req.params;
        const item = await getItemById(itemId);
        return res.json(item);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// Log learning
// ==========================================
export const logLearningController = async (
    req: AuthRequest<{ itemId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const childId = req.user!.userId;
        const { itemId } = req.params;
        const result = await logLearning(childId, itemId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};