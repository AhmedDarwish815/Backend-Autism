import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import {
    getRoutineTasks,
    addTask,
    deleteTask,
    getTodayRoutine,
    completeTask,
    skipTask,
    getRoutineProgress,
} from "./routine.service";

export const getRoutineTasksController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const tasks = await getRoutineTasks(childId);
        return res.json({ tasks });
    } catch (err) { next(err); }
};

export const addTaskController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const { title, scheduledTime, iconName } = req.body;
        const task = await addTask(childId, title, scheduledTime, iconName);
        return res.status(201).json(task);
    } catch (err) { next(err); }
};

export const deleteTaskController = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const { taskId } = req.params;
        const result = await deleteTask(childId, taskId);
        return res.json(result);
    } catch (err) { next(err); }
};

export const getTodayRoutineController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const routine = await getTodayRoutine(childId);
        return res.json({ routine });
    } catch (err) { next(err); }
};

export const completeTaskController = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const { taskId } = req.params;
        const result = await completeTask(childId, taskId);
        return res.json(result);
    } catch (err) { next(err); }
};

export const skipTaskController = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const { taskId } = req.params;
        const result = await skipTask(childId, taskId);
        return res.json(result);
    } catch (err) { next(err); }
};

export const getRoutineProgressController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const childId = req.user!.userId;
        const progress = await getRoutineProgress(childId);
        return res.json(progress);
    } catch (err) { next(err); }
};