import { Router } from "express";
import {
    createChatSessionController,
    getChatSessionsController,
    getChatMessagesController,
    sendMessageController,
    deleteChatSessionController,
} from "./chatbot.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";
import { validate } from "../../utils/validate";
import {
    createChatSessionSchema,
    getChatSessionsSchema,
    getChatMessagesSchema,
    sendMessageSchema,
    deleteChatSessionSchema,
} from "./chatbot.schemas";

const router = Router();

// ==========================================
// ✅ Chat Sessions Routes
// ==========================================

// الحصول على جلسات المحادثة
router.get(
    "/sessions",
    requireAuth,
    requireParent,
    validate(getChatSessionsSchema),
    getChatSessionsController
);

// إنشاء جلسة محادثة جديدة
router.post(
    "/sessions",
    requireAuth,
    requireParent,
    validate(createChatSessionSchema),
    createChatSessionController
);

// حذف جلسة محادثة
router.delete(
    "/sessions/:sessionId",
    requireAuth,
    requireParent,
    validate(deleteChatSessionSchema),
    deleteChatSessionController
);

// ==========================================
// ✅ Chat Messages Routes
// ==========================================

// الحصول على رسائل جلسة محددة
router.get(
    "/sessions/:sessionId/messages",
    requireAuth,
    requireParent,
    validate(getChatMessagesSchema),
    getChatMessagesController
);

// إرسال رسالة والحصول على رد من AI
router.post(
    "/sessions/:sessionId/messages",
    requireAuth,
    requireParent,
    validate(sendMessageSchema),
    sendMessageController
);

export default router;