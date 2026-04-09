import { prisma } from "../../config/prisma";
import bcrypt from "bcryptjs";

// ==========================================
// ✅ خدمة: الحصول على البروفايل
// ==========================================
export const getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        },
    });

    if (!user) {
        throw Object.assign(new Error("User not found"), { status: 404 });
    }

    return user;
};

// ==========================================
// ✅ خدمة: تحديث البروفايل
// ==========================================
export const updateProfile = async (
    userId: string,
    data: {
        fullName?: string;
        phone?: string;
    }
    ) => {
    const updateData: any = {};

    if (data.fullName !== undefined) {
        if (data.fullName.trim().length < 2) {
        throw Object.assign(new Error("Full name must be at least 2 characters"), {
            status: 400,
        });
        }
        updateData.fullName = data.fullName.trim();
    }

    if (data.phone !== undefined) {
        updateData.phone = data.phone.trim() || null;
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        updatedAt: true,
        },
    });

    return user;
};

// ==========================================
// ✅ خدمة: تغيير كلمة المرور
// ==========================================
export const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
    ) => {
    if (!currentPassword || !newPassword) {
        throw Object.assign(
        new Error("Current password and new password are required"),
        { status: 400 }
        );
    }

    if (newPassword.length < 6) {
        throw Object.assign(
        new Error("New password must be at least 6 characters"),
        { status: 400 }
        );
    }

    // الحصول على كلمة المرور الحالية
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
    });

    if (!user) {
        throw Object.assign(new Error("User not found"), { status: 404 });
    }

    // التحقق من كلمة المرور الحالية
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
        throw Object.assign(new Error("Current password is incorrect"), {
        status: 400,
        });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // تحديث كلمة المرور
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { ok: true, message: "Password changed successfully" };
};