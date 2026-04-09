import { prisma } from "../../config/prisma";
import { addStarToChild } from "../learning/learning.service";

const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const getRoutineTasks = async (childId: string) => {
    return prisma.routineTask.findMany({
        where: { OR: [{ isDefault: true }, { childId }] },
        orderBy: { sortOrder: "asc" },
    });
};

export const addTask = async (childId: string, title: string, scheduledTime?: string, iconName?: string) => {
    if (!title || title.trim().length === 0) {
        throw Object.assign(new Error("Title is required"), { status: 400 });
    }
    return prisma.routineTask.create({
        data: {
            title: title.trim(),
            scheduledTime: scheduledTime || null,
            iconName: iconName || null,
            isDefault: false,
            childId,
            sortOrder: 99,
        },
    });
};

export const deleteTask = async (childId: string, taskId: string) => {
    const task = await prisma.routineTask.findUnique({
        where: { id: taskId },
        select: { id: true, isDefault: true, childId: true },
    });
    if (!task) throw Object.assign(new Error("Task not found"), { status: 404 });
    if (task.isDefault) throw Object.assign(new Error("Cannot delete default tasks"), { status: 403 });
    if (task.childId !== childId) throw Object.assign(new Error("Unauthorized"), { status: 403 });

    await prisma.routineTask.delete({ where: { id: taskId } });
    return { ok: true, message: "Task deleted successfully" };
};

export const getTodayRoutine = async (childId: string) => {
    const today = getTodayDate();
    const tasks = await prisma.routineTask.findMany({
        where: { OR: [{ isDefault: true }, { childId }] },
        orderBy: { sortOrder: "asc" },
    });
    const logs = await prisma.routineLog.findMany({ where: { childId, date: today } });
    const logMap = new Map(logs.map((l) => [l.taskId, l]));

    return tasks.map((task) => {
        const log = logMap.get(task.id);
        return { ...task, status: log?.status || "PENDING", completedAt: log?.completedAt || null };
    });
};

export const completeTask = async (childId: string, taskId: string) => {
    const today = getTodayDate();
    const task = await prisma.routineTask.findUnique({ where: { id: taskId }, select: { id: true } });
    if (!task) throw Object.assign(new Error("Task not found"), { status: 404 });

    await prisma.routineLog.upsert({
        where: { childId_taskId_date: { childId, taskId, date: today } },
        create: { childId, taskId, date: today, status: "COMPLETED", completedAt: new Date() },
        update: { status: "COMPLETED", completedAt: new Date() },
    });

    await addStarToChild(childId, 2);
    await checkRoutineBadge(childId);

    return { ok: true, message: "Task completed!", stars: 2 };
};

export const skipTask = async (childId: string, taskId: string) => {
    const today = getTodayDate();
    const task = await prisma.routineTask.findUnique({ where: { id: taskId }, select: { id: true } });
    if (!task) throw Object.assign(new Error("Task not found"), { status: 404 });

    await prisma.routineLog.upsert({
        where: { childId_taskId_date: { childId, taskId, date: today } },
        create: { childId, taskId, date: today, status: "SKIPPED" },
        update: { status: "SKIPPED" },
    });

    return { ok: true, message: "Task skipped" };
};

export const getRoutineProgress = async (childId: string) => {
    const today = getTodayDate();
    const totalTasks = await prisma.routineTask.count({
        where: { OR: [{ isDefault: true }, { childId }] },
    });
    const completedTasks = await prisma.routineLog.count({
        where: { childId, date: today, status: "COMPLETED" },
    });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, percentage, date: today };
};

const checkRoutineBadge = async (childId: string) => {
    const today = getTodayDate();
    const totalTasks = await prisma.routineTask.count({
        where: { OR: [{ isDefault: true }, { childId }] },
    });
    const completedTasks = await prisma.routineLog.count({
        where: { childId, date: today, status: "COMPLETED" },
    });
    if (completedTasks >= totalTasks && totalTasks > 0) {
        await prisma.badge.upsert({
            where: { childId_type: { childId, type: "ROUTINE_CHAMPION" } },
            create: { childId, type: "ROUTINE_CHAMPION" },
            update: {},
        });
    }
};