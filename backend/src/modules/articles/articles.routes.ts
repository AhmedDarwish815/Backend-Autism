import { Router } from "express";
import {
    getArticlesController,
    getArticleByIdController,
} from "./articles.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// الحصول على كل المقالات
router.get("/", requireAuth, getArticlesController);

// الحصول على مقال واحد
router.get("/:articleId", requireAuth, getArticleByIdController);

export default router;