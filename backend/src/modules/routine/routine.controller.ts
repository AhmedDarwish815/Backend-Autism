import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { prisma } from "../../config/prisma";
import {
    getRoutineTasks,
    addTask,
    deleteTask,
    getTodayRoutine,
    completeTask,
    skipTask,
    getRoutineProgress,
    getRoutineCatalog,
    addTemplateToRoutine,
} from "./routine.service";

export const getRoutineCatalogController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const catalog = await getRoutineCatalog();
        return res.json({ catalog });
    } catch (err) { next(err); }
};

export const getRoutineTasksController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.query.childId) {
            childId = req.query.childId as string;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const tasks = await getRoutineTasks(childId);
        return res.json({ tasks });
    } catch (err) { next(err); }
};

export const addTemplateToRoutineController = async (req: AuthRequest<{ templateId: string }>, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.body.childId) {
            childId = req.body.childId;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const { templateId } = req.params;
        const task = await addTemplateToRoutine(childId, templateId);
        return res.status(201).json(task);
    } catch (err) { next(err); }
};

export const addTaskController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.body.childId) {
            childId = req.body.childId;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const { title, scheduledTime, iconName } = req.body;
        const task = await addTask(childId, title, scheduledTime, iconName);
        return res.status(201).json(task);
    } catch (err) { next(err); }
};

export const deleteTaskController = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.query.childId) {
            childId = req.query.childId as string;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const { taskId } = req.params;
        const result = await deleteTask(childId, taskId);
        return res.json(result);
    } catch (err) { next(err); }
};

export const getTodayRoutineController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.query.childId) {
            childId = req.query.childId as string;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const routine = await getTodayRoutine(childId);
        return res.json({ routine });
    } catch (err) { next(err); }
};

export const completeTaskController = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.body.childId) {
            childId = req.body.childId;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const { taskId } = req.params;
        const result = await completeTask(childId, taskId);
        return res.json(result);
    } catch (err) { next(err); }
};

export const skipTaskController = async (req: AuthRequest<{ taskId: string }>, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.body.childId) {
            childId = req.body.childId;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const { taskId } = req.params;
        const result = await skipTask(childId, taskId);
        return res.json(result);
    } catch (err) { next(err); }
};

export const getRoutineProgressController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let childId = req.user!.userId;
        if (req.user!.role === "PARENT" && req.query.childId) {
            childId = req.query.childId as string;
            const childVerify = await prisma.user.findFirst({ where: { id: childId, parentId: req.user!.userId } });
            if (!childVerify) throw Object.assign(new Error("Unauthorized: Child not found or does not belong to you"), { status: 403 });
        }
        const progress = await getRoutineProgress(childId);
        return res.json(progress);
    } catch (err) { next(err); }
};