import { Router } from "express";
import { createUserController } from "./user.controller";
import { requireAuth, requireParent } from "../../middlewares/auth";

const router = Router();

router.post("/", requireAuth, requireParent, createUserController); // ✅ محمي

export default router;