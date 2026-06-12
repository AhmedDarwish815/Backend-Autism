import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import {
  registerParent,
  loginUser,
  refreshAccessToken,
  logout,
  createChildForParent,
  getChildrenForParent,
  changeChildPassword,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyEmail,
} from "./auth.service";
import { Gender } from "@prisma/client";

export const registerParentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, phone, email, password, confirmPassword } = req.body ?? {};
    if (confirmPassword !== undefined && confirmPassword !== password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await registerParent(email, password, fullName, phone);
    return res.status(201).json(user);
  } catch (err) { next(err); }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body ?? {};
    const result = await loginUser(email, password);
    return res.json(result);
  } catch (err) { next(err); }
};

export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body ?? {};
    const result = await refreshAccessToken(refreshToken);
    return res.json(result);
  } catch (err) { next(err); }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body ?? {};
    const result = await logout(refreshToken);
    return res.json(result);
  } catch (err) { next(err); }
};

export const createChildController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user!.userId;
    const { email, password, confirmPassword, childName, gender, dateOfBirth } = req.body ?? {};
    if (confirmPassword !== undefined && confirmPassword !== password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const child = await createChildForParent(parentId, email, password, childName, gender as Gender | undefined, dateOfBirth);
    return res.status(201).json({ child });
  } catch (err) { next(err); }
};

export const getMyChildrenController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user!.userId;
    const children = await getChildrenForParent(parentId);
    return res.json({ children });
  } catch (err) { next(err); }
};

export const changeChildPasswordController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user!.userId;
    const rawChildId = (req.params as any).childId;
    const childId = Array.isArray(rawChildId) ? rawChildId[0] : rawChildId;
    const { newPassword } = req.body ?? {};
    const result = await changeChildPassword(parentId, childId, newPassword);
    return res.json(result);
  } catch (err) { next(err); }
};

export const forgotPasswordRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body ?? {};
    const result = await requestPasswordReset(email);
    return res.json(result);
  } catch (err) { next(err); }
};

export const forgotPasswordVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body ?? {};
    const result = await verifyResetCode(email, code);
    return res.json(result);
  } catch (err) { next(err); }
};

export const forgotPasswordResetController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body ?? {};
    const result = await resetPassword(token, newPassword);
    return res.json(result);
  } catch (err) { next(err); }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword);
    return res.json(result);
  } catch (err) { next(err); }
};

// ✅ جديد
export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query as { token: string };
    await verifyEmail(token);
    
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم التأكيد بنجاح</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%; }
        .icon { font-size: 60px; margin-bottom: 20px; }
        h1 { color: #6C63FF; margin-bottom: 10px; font-size: 24px; }
        p { color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #6C63FF; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: background 0.3s; }
        .btn:hover { background-color: #5750d1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🎉</div>
        <h1>تم تأكيد حسابك بنجاح!</h1>
        <p>شكراً لك. تم تفعيل بريدك الإلكتروني بنجاح، يمكنك الآن العودة إلى التطبيق وتسجيل الدخول للبدء في استخدام كافة الميزات.</p>
        <a href="#" onclick="window.close()" class="btn">إغلاق الصفحة</a>
      </div>
    </body>
    </html>
    `;
    return res.send(html);
  } catch (err: any) {
    const errorHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فشل التأكيد</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%; }
        .icon { font-size: 60px; margin-bottom: 20px; }
        h1 { color: #e74c3c; margin-bottom: 10px; font-size: 24px; }
        p { color: #555; line-height: 1.6; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">❌</div>
        <h1>عذراً، فشل التأكيد</h1>
        <p>${err?.message === "Invalid or expired token" ? "الرابط الذي استخدمته غير صالح أو منتهي الصلاحية. يرجى طلب رابط تأكيد جديد." : "حدث خطأ غير متوقع أثناء محاولة تأكيد حسابك."}</p>
      </div>
    </body>
    </html>
    `;
    return res.status(400).send(errorHtml);
  }
};