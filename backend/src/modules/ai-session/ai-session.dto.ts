import { z } from "zod";

// ==========================================
// Emotion Distribution Schema
// كل مشاعر لازم تكون بين 0 و 1
// ومجموعهم يقترب من 1.0
// ==========================================
const emotionDistributionSchema = z
    .object({
        happy:   z.number().min(0).max(1),
        sad:     z.number().min(0).max(1),
        angry:   z.number().min(0).max(1),
        neutral: z.number().min(0).max(1),
    })
    .refine(
        (data) => {
            const total = data.happy + data.sad + data.angry + data.neutral;
            return total >= 0.98 && total <= 1.02; // نسمح بـ floating point error صغيرة
        },
        { message: "emotion_distribution values must sum to approximately 1.0" }
    );

// ==========================================
// السيكشن المسموح بيه (بنقبل lowercase)
// ==========================================
const appSectionEnum = z.enum([
    "home", "games", "learning", "skills", "routine", "profile",
    "HOME", "GAMES", "LEARNING", "SKILLS", "ROUTINE", "PROFILE"
]).transform((val) => val.toUpperCase() as "HOME" | "GAMES" | "LEARNING" | "SKILLS" | "ROUTINE" | "PROFILE");

// ==========================================
// المشاعر الغالبة المسموح بيها (بنقبل lowercase)
// ==========================================
const dominantEmotionEnum = z.enum([
    "happy", "sad", "angry", "neutral",
    "HAPPY", "SAD", "ANGRY", "NEUTRAL"
]).transform((val) => val.toUpperCase() as "HAPPY" | "SAD" | "ANGRY" | "NEUTRAL");

// ==========================================
// Schema الأساسي للـ Request
// ==========================================
export const createAISessionSchema = z.object({
    user_id: z.string().min(1, { message: "user_id is required" }),

    section: appSectionEnum,

    game: z.string().trim().min(1).nullable().optional().default(null),

    start_time: z.string().min(10, { message: "start_time must be provided" }),

    end_time: z.string().min(10, { message: "end_time must be provided" }),

    duration: z
        .number()
        .int({ message: "duration must be an integer" })
        .min(1, { message: "duration must be at least 1 second" }),

    focus_score: z
        .number()
        .min(0, { message: "focus_score must be >= 0" })
        .max(1, { message: "focus_score must be <= 1" }),

    emotion_distribution: emotionDistributionSchema,

    dominant_emotion: dominantEmotionEnum,
}).refine(
    (data) => new Date(data.end_time) > new Date(data.start_time),
    { message: "end_time must be after start_time", path: ["end_time"] }
);

export type CreateAISessionDTO = z.infer<typeof createAISessionSchema>;
