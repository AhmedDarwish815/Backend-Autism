import { Router } from "express";
import {
    getRoutineTasksController,
    addTaskController,
    deleteTaskController,
    getTodayRoutineController,
    completeTaskController,
    skipTaskController,
    getRoutineProgressController,
} from "./routine.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.get("/tasks", requireAuth, getRoutineTasksController);
router.post("/tasks", requireAuth, addTaskController);
router.delete("/tasks/:taskId", requireAuth, deleteTaskController);
router.get("/today", requireAuth, getTodayRoutineController);
router.post("/tasks/:taskId/complete", requireAuth, completeTaskController);
router.post("/tasks/:taskId/skip", requireAuth, skipTaskController);
router.get("/progress", requireAuth, getRoutineProgressController);

export default router;