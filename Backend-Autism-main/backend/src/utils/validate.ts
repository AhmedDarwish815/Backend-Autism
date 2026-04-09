import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
    (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
        try {
        const parsed = schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        
        (req as any).validated = parsed;

        next();
        } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
            message: "Validation error",
            errors: err.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            })),
            });
        }
        next(err);
        }
    };
