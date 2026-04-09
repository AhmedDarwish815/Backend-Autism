import { Router } from "express";
import {
    getCategoriesController,
    getItemsByCategoryController,
    getItemByIdController,
    logLearningController,
} from "./learning.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// الحصول على كل الـ categories
router.get("/categories", requireAuth, getCategoriesController);

// الحصول على items بتاعة category معينة
router.get("/categories/:category", requireAuth, getItemsByCategoryController);

// الحصول على item واحد
router.get("/items/:itemId", requireAuth, getItemByIdController);

// تسجيل إن الطفل شاف item
router.post("/items/:itemId/log", requireAuth, logLearningController);

export default router;