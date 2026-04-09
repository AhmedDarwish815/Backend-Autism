import { prisma } from "../../config/prisma";
import bcrypt from "bcrypt";

export const createUser = async (email: string, password: string) => {
    const hashed = await bcrypt.hash(password, 10);
    return await prisma.user.create({
        data: {
            email,
            password: hashed,
            role: "PARENT",
        },
    });
};