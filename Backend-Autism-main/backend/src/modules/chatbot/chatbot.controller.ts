import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import {
    createChatSession,
    getChatSessions,
    getChatMessages,
    sendMessage,
    deleteChatSession,
} from "./chatbot.service";

// ==========================================
// ✅ Controller: إنشاء جلسة محادثة جديدة
// ==========================================
export const createChatSessionController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { title } = req.body;

        const session = await createChatSession(userId, title);
        return res.status(201).json(session);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: الحصول على جلسات المحادثة
// ==========================================
export const getChatSessionsController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { limit, offset } = req.query;

        const sessions = await getChatSessions(
        userId,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
        );

        return res.json({ sessions });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: الحصول على رسائل جلسة
// ==========================================
export const getChatMessagesController = async (
    req: AuthRequest<{ sessionId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { sessionId } = req.params;
        const { limit, offset } = req.query;

        const messages = await getChatMessages(
        sessionId,
        userId,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
        );

        return res.json({ messages });
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: إرسال رسالة
// ==========================================
export const sendMessageController = async (
    req: AuthRequest<{ sessionId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { sessionId } = req.params;
        const { content } = req.body;

        const result = await sendMessage(sessionId, userId, content);
        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: حذف جلسة محادثة
// ==========================================
export const deleteChatSessionController = async (
    req: AuthRequest<{ sessionId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { sessionId } = req.params;

        const result = await deleteChatSession(sessionId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};