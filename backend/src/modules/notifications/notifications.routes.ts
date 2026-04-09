import { Router } from "express";
import {
    getNotificationsController,
    markAsReadController,
    markAllAsReadController,
    deleteNotificationController,
    createTestNotificationController,
} from "./notifications.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";
import { validate } from "../../utils/validate";
import {
    getNotificationsSchema,
    markAsReadSchema,
    deleteNotificationSchema,
    createTestNotificationSchema,
    } from "./notifications.schemas";

const router = Router();

// ==========================================
// ✅ Notifications Routes
// ==========================================

// الحصول على الإشعارات
router.get(
    "/",
    requireAuth,
    requireParent,
    validate(getNotificationsSchema),
    getNotificationsController
);

// تعليم كل الإشعارات كمقروءة
router.post(
    "/mark-all-read",
    requireAuth,
    requireParent,
    markAllAsReadController
);

// تعليم إشعار كمقروء
router.patch(
    "/:notificationId/read",
    requireAuth,
    requireParent,
    validate(markAsReadSchema),
    markAsReadController
);

// حذف إشعار
router.delete(
    "/:notificationId",
    requireAuth,
    requireParent,
    validate(deleteNotificationSchema),
    deleteNotificationController
);

// ✅ للاختبار فقط: إنشاء إشعار تجريبي
router.post(
    "/test",
    requireAuth,
    requireParent,
    validate(createTestNotificationSchema),
    createTestNotificationController
);

export default router;