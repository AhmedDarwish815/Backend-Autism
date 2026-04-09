import { Router } from "express";
import {
  registerParentController,
  loginController,
  refreshController,
  logoutController,
  createChildController,
  getMyChildrenController,
  changeChildPasswordController,
  forgotPasswordRequestController,
  forgotPasswordVerifyController,
  forgotPasswordResetController,
  resetPasswordController,
  verifyEmailController,
} from "./auth.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";
import { validate } from "../../utils/validate";
import {
  registerParentSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  createChildSchema,
  changeChildPasswordSchema,
  forgotPasswordRequestSchema,
  forgotPasswordVerifySchema,
  resetPasswordSchema,
} from "./auth.schemas";

const router = Router();

router.post("/register-parent", validate(registerParentSchema), registerParentController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh", validate(refreshSchema), refreshController);
router.post("/logout", validate(logoutSchema), logoutController);

// ✅ Email Verification
router.get("/verify-email", verifyEmailController);

// Parent only
router.post("/create-child", requireAuth, requireParent, validate(createChildSchema), createChildController);
router.get("/my-children", requireAuth, requireParent, getMyChildrenController);
router.patch("/children/:childId/password", requireAuth, requireParent, validate(changeChildPasswordSchema), changeChildPasswordController);

// Forgot password (Email OTP)
router.post("/forgot/request", validate(forgotPasswordRequestSchema), forgotPasswordRequestController);
router.post("/forgot/verify", validate(forgotPasswordVerifySchema), forgotPasswordVerifyController);
router.post("/forgot/reset", validate(resetPasswordSchema), forgotPasswordResetController);
router.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);

export default router;