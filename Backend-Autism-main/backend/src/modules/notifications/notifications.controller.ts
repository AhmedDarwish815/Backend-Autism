import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    } from "./notifications.service";

// ==========================================
// ✅ Controller: الحصول على الإشعارات
// ==========================================
export const getNotificationsController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { unreadOnly, limit, offset } = req.query;

        const filters = {
        unreadOnly: unreadOnly === "true",
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        };

        const result = await getNotifications(userId, filters);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: تعليم إشعار كمقروء
// ==========================================
export const markAsReadController = async (
    req: AuthRequest<{ notificationId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { notificationId } = req.params;

        const result = await markAsRead(notificationId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: تعليم كل الإشعارات كمقروءة
// ==========================================
export const markAllAsReadController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;

        const result = await markAllAsRead(userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: حذف إشعار
// ==========================================
export const deleteNotificationController = async (
    req: AuthRequest<{ notificationId: string }>,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { notificationId } = req.params;

        const result = await deleteNotification(notificationId, userId);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

// ==========================================
// ✅ Controller: إنشاء إشعار تجريبي (للاختبار فقط)
// ==========================================
export const createTestNotificationController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const userId = req.user!.userId;
        const { type, title, message } = req.body;

        const notification = await createNotification({
        userId,
        type,
        title,
        message,
        });

        return res.status(201).json(notification);
    } catch (err) {
        next(err);
    }
};