import { z } from "zod";

const email = z.string().email("Invalid email");
const password = z.string().min(6, "Password must be at least 6 characters");

// ✅ Register Parent Schema - متطابق مع الـ UI
export const registerParentSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email,
    phone: z.string().optional(),
    password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

export const loginSchema = z.object({
  body: z.object({ email, password }),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10, "refreshToken is required") }),
});

export const logoutSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10, "refreshToken is required") }),
});

// ✅ Create Child Schema - متطابق مع الـ UI
export const createChildSchema = z.object({
  body: z.object({
    childName: z.string().min(2, "Child name is required"),
    email,
    password,
    confirmPassword: z.string(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    dateOfBirth: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

export const changeChildPasswordSchema = z.object({
  params: z.object({ childId: z.string().uuid("Invalid childId") }),
  body: z.object({ newPassword: password }),
});

// ✅ Forgot Password Schemas
export const forgotPasswordRequestSchema = z.object({
  body: z.object({ email }),
});

export const forgotPasswordVerifySchema = z.object({
  body: z.object({
    email,
    code: z.string().length(6, "Code must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: password,
  }),
});