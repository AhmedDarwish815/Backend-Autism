import bcrypt from "bcrypt";
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { Role, Gender } from "@prisma/client";
import { sendResetCodeEmail, sendVerificationEmail } from "../../utils/mailer";

type JwtPayload = { userId: string; role: Role };

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_DAYS = 7;
const RESET_CODE_MINUTES = 10;
const VERIFY_HOURS = 24;

const must = (v: any, msg: string) => {
    if (!v) throw Object.assign(new Error(msg), { status: 400 });
};

const isEmail = (email: string) => email.includes("@") && email.includes(".");

const blockedDomains = [
    "test.com", "fake.com", "tempmail.com", "mailinator.com",
    "yopmail.com", "guerrillamail.com", "trashmail.com", "sharklasers.com",
    "throwam.com", "dispostable.com", "maildrop.cc", "temp-mail.org",
];

const isBlockedDomain = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return blockedDomains.includes(domain);
};

const signAccessToken = (userId: string, role: Role) => {
    const secret = process.env.JWT_ACCESS_SECRET as jwt.Secret;
    if (!secret) throw new Error("JWT_ACCESS_SECRET missing");
    const options: jwt.SignOptions = { expiresIn: ACCESS_EXPIRES as any };
    return jwt.sign({ userId, role }, secret, options);
};

const makeRefreshToken = () => crypto.randomBytes(48).toString("hex");
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const addDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const addMinutes = (m: number) => new Date(Date.now() + m * 60 * 1000);
const addHours = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);

// -------------------- Register Parent --------------------
export const registerParent = async (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
) => {
    must(email, "Email is required");
    must(password, "Password is required");
    if (!isEmail(email)) throw Object.assign(new Error("Invalid email"), { status: 400 });
    if (password.length < 6)
        throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });

    // ✅ Blocklist
    if (isBlockedDomain(email))
        throw Object.assign(new Error("Please use a real email address"), { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
                role: "PARENT",
                fullName: fullName?.trim() || null,
                phone: phone?.trim() || null,
                isVerified: false,
            },
            select: { id: true, email: true, role: true, fullName: true, phone: true, createdAt: true },
        });

        // ✅ ابعت verification email
        const token = crypto.randomBytes(32).toString("hex");
        await prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: addHours(VERIFY_HOURS),
            },
        });
        await sendVerificationEmail(email, token);

        return { ...user, message: "Please check your email to verify your account" };
    } catch (e: any) {
        if (e.code === "P2002") throw Object.assign(new Error("Email already exists"), { status: 400 });
        throw e;
    }
};

// -------------------- Verify Email --------------------
export const verifyEmail = async (token: string) => {
    must(token, "Token is required");

    const record = await prisma.emailVerificationToken.findFirst({
        where: { token, used: false, expiresAt: { gt: new Date() } },
    });

    if (!record) throw Object.assign(new Error("Invalid or expired token"), { status: 400 });

    await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
        prisma.emailVerificationToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);

    return { ok: true, message: "Email verified successfully" };
};

// -------------------- Login --------------------
export const loginUser = async (email: string, password: string) => {
    must(email, "Email is required");
    must(password, "Password is required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    // ✅ تحقق من الـ verification
    if (!user.isVerified)
        throw Object.assign(new Error("Please verify your email before logging in"), { status: 403 });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = makeRefreshToken();
    const tokenHash = sha256(refreshToken);

    await prisma.refreshToken.create({
        data: { userId: user.id, tokenHash, expiresAt: addDays(REFRESH_DAYS) },
    });

    const home = user.role === "PARENT" ? "PARENT_HOME" : "CHILD_HOME";
    return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
        home,
    };
};

// -------------------- Refresh --------------------
export const refreshAccessToken = async (refreshToken: string) => {
    must(refreshToken, "refreshToken is required");

    const tokenHash = sha256(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
        where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
        include: { user: true },
    });

    if (!stored) throw Object.assign(new Error("Invalid refresh token"), { status: 401 });

    const accessToken = signAccessToken(stored.userId, stored.user.role);
    return { accessToken };
};

// -------------------- Logout --------------------
export const logout = async (refreshToken: string) => {
    must(refreshToken, "refreshToken is required");

    const tokenHash = sha256(refreshToken);
    await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
    });

    return { ok: true };
};

// -------------------- Parent creates Child --------------------
const ensureParent = async (parentId: string) => {
    const parent = await prisma.user.findUnique({ where: { id: parentId } });
    if (!parent || parent.role !== "PARENT")
        throw Object.assign(new Error("Parent not found"), { status: 404 });
    return parent;
};

export const createChildForParent = async (
    parentId: string,
    childEmail: string,
    childPassword: string,
    childName: string,
    gender?: Gender,
    dateOfBirth?: string
) => {
    await ensureParent(parentId);

    must(childEmail, "Child email is required");
    must(childPassword, "Child password is required");
    must(childName, "Child name is required");

    if (!isEmail(childEmail)) throw Object.assign(new Error("Invalid child email"), { status: 400 });
    if (isBlockedDomain(childEmail))
        throw Object.assign(new Error("Please use a real email address"), { status: 400 });
    if (childPassword.length < 6)
        throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });

    const hashed = await bcrypt.hash(childPassword, 10);

    try {
        const child = await prisma.user.create({
            data: {
                email: childEmail,
                password: hashed,
                role: "CHILD",
                parentId,
                isVerified: true, // ✅ الـ child بيتعمله verified تلقائي لأن الـ parent هو اللي بيعمله
                childProfile: {
                    create: {
                        name: childName.trim(),
                        gender: gender || null,
                        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    },
                },
            },
            select: { id: true, email: true, role: true, parentId: true, createdAt: true },
        });

        return child;
    } catch (e: any) {
        if (e.code === "P2002") throw Object.assign(new Error("Email already exists"), { status: 400 });
        throw e;
    }
};

export const getChildrenForParent = async (parentId: string) => {
    await ensureParent(parentId);

    return prisma.user.findMany({
        where: { parentId, role: "CHILD" },
        select: {
            id: true,
            email: true,
            createdAt: true,
            childProfile: { select: { name: true, gender: true, dateOfBirth: true } },
        },
    });
};

export const changeChildPassword = async (parentId: string, childId: string, newPassword: string) => {
    await ensureParent(parentId);
    must(childId, "childId is required");
    must(newPassword, "newPassword is required");
    if (newPassword.length < 6)
        throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });

    const child = await prisma.user.findFirst({
        where: { id: childId, parentId, role: "CHILD" },
        select: { id: true },
    });
    if (!child) throw Object.assign(new Error("Child not found"), { status: 404 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: childId }, data: { password: hashed } });

    return { ok: true };
};

// -------------------- Forgot Password (Email OTP) --------------------
const make6DigitCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const requestPasswordReset = async (email: string) => {
    must(email, "Email is required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true };

    const code = make6DigitCode();
    const codeHash = sha256(code);

    await prisma.passwordResetToken.create({
        data: { userId: user.id, codeHash, expiresAt: addMinutes(RESET_CODE_MINUTES) },
    });

    await sendResetCodeEmail(email, code);
    return { ok: true };
};

export const verifyResetCode = async (email: string, code: string) => {
    must(email, "Email is required");
    must(code, "Code is required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error("Invalid code"), { status: 400 });

    const codeHash = sha256(code);
    const token = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id, codeHash, used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
    });

    if (!token) throw Object.assign(new Error("Invalid code"), { status: 400 });

    return { resetToken: token.id };
};

export const resetPassword = async (resetToken: string, newPassword: string) => {
    must(resetToken, "resetToken is required");
    must(newPassword, "newPassword is required");
    if (newPassword.length < 6)
        throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });

    const token = await prisma.passwordResetToken.findFirst({
        where: { id: resetToken, used: false, expiresAt: { gt: new Date() } },
        include: { user: true },
    });

    if (!token) throw Object.assign(new Error("Invalid reset token"), { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
        prisma.user.update({ where: { id: token.userId }, data: { password: hashed } }),
        prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } }),
        prisma.refreshToken.updateMany({ where: { userId: token.userId }, data: { revoked: true } }),
    ]);

    return { ok: true };
};