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
    const result = await verifyEmail(token);
    return res.json(result);
  } catch (err) { next(err); }
};