import { prisma } from "../../config/prisma";

// ==========================================
// ✅ خدمة: الحصول على الإشعارات
// ==========================================
export const getNotifications = async (
    userId: string,
    filters?: {
        unreadOnly?: boolean;
        limit?: number;
        offset?: number;
    }
    ) => {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const where: any = { userId };

    if (filters?.unreadOnly) {
        where.read = false;
    }

    const notifications = await prisma.notification.findMany({
        where,
        select: {
        id: true,
        type: true,
        title: true,
        message: true,
        relatedId: true,
        relatedType: true,
        actionUrl: true,
        read: true,
        createdAt: true,
        },
        orderBy: {
        createdAt: "desc",
        },
        take: limit,
        skip: offset,
    });

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = await prisma.notification.count({
        where: {
        userId,
        read: false,
        },
    });

    return {
        notifications,
        unreadCount,
    };
};

// ==========================================
// ✅ خدمة: تعليم إشعار كمقروء
// ==========================================
export const markAsRead = async (notificationId: string, userId: string) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { id: true, userId: true, read: true },
    });

    if (!notification) {
        throw Object.assign(new Error("Notification not found"), { status: 404 });
    }

    if (notification.userId !== userId) {
        throw Object.assign(new Error("Unauthorized"), { status: 403 });
    }

    if (notification.read) {
        return { ok: true, message: "Already marked as read" };
    }

    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });

    return { ok: true, message: "Notification marked as read" };
};

// ==========================================
// ✅ خدمة: تعليم كل الإشعارات كمقروءة
// ==========================================
export const markAllAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
        where: {
        userId,
        read: false,
        },
        data: {
        read: true,
        },
    });

    return {
        ok: true,
        message: "All notifications marked as read",
        count: result.count,
    };
};

// ==========================================
// ✅ خدمة: حذف إشعار
// ==========================================
export const deleteNotification = async (
    notificationId: string,
    userId: string
    ) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { id: true, userId: true },
    });

    if (!notification) {
        throw Object.assign(new Error("Notification not found"), { status: 404 });
    }

    if (notification.userId !== userId) {
        throw Object.assign(new Error("Unauthorized"), { status: 403 });
    }

    await prisma.notification.delete({
        where: { id: notificationId },
    });

    return { ok: true, message: "Notification deleted successfully" };
};

// ==========================================
// ✅ خدمة: إنشاء إشعار (للاستخدام الداخلي)
// ==========================================
export const createNotification = async (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
    }) => {
    const notification = await prisma.notification.create({
        data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        actionUrl: data.actionUrl,
        },
        select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        },
    });

    return notification;
};