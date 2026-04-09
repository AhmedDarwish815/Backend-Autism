import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { ParamsDictionary } from "express-serve-static-core";

type JwtPayload = { userId: string; role: "PARENT" | "CHILD" };


export interface AuthRequest<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any
    > extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: JwtPayload;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });

    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
    };

    export const requireParent = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "PARENT") return res.status(403).json({ message: "Parent only" });
    next();
};
