import { z } from "zod";

// ==========================================
// ✅ Schema: تحديث البروفايل
// ==========================================
export const updateProfileSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
        phone: z.string().optional(),
    }),
});

// ==========================================
// ✅ Schema: تغيير كلمة المرور
// ==========================================
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
    }),
});