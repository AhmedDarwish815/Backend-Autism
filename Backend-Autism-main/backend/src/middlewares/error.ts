import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
    // ✅ Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
        message: "Validation error",
        errors: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
        })),
        });
    }

    // ✅ Prisma unique constraint (P2002)
    if (err?.code === "P2002") {
        return res.status(400).json({
        message: "Unique constraint failed",
        meta: err?.meta,
        });
    }

    const status = err?.status || 500;

    // ✅ Production-friendly response (ما نطلعش stack للعميل)
    return res.status(status).json({
        message: err?.message || "Internal Server Error",
    });
};
