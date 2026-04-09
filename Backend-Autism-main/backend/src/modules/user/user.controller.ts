import { Request, Response } from "express";
import { createUser } from "./user.service";

export const createUserController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await createUser(email, password);

        res.json(user);
    } catch (error: any) {
    if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
    }

    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
    }

};
