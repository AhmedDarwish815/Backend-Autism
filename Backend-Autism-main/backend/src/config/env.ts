import { z } from "zod";

const envSchema = z.object({
    PORT: z.string().default("4000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
    MAILTRAP_USER: z.string().min(1, "MAILTRAP_USER is required"),
    MAILTRAP_PASS: z.string().min(1, "MAILTRAP_PASS is required"),
    APP_URL: z.string().default("http://localhost:4000"),
    GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
    AI_API_URL: z.string().default("http://127.0.0.1:5000/predict"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    parsed.error.issues.forEach((i) => {
        console.error(`   - ${i.path.join(".")}: ${i.message}`);
    });
    process.exit(1);
}

export const env = parsed.data;