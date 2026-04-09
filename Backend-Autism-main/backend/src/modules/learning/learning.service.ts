import { prisma } from "../../config/prisma";
import { LearningCategory } from "@prisma/client";

const ALL_CATEGORIES = [
    { key: "PEOPLE",           label: "People",           emoji: "👨‍👩‍👧" },
    { key: "SCHOOL",           label: "School",           emoji: "🏫" },
    { key: "ANIMALS",          label: "Animals",          emoji: "🐾" },
    { key: "COLORS",           label: "Colors",           emoji: "🎨" },
    { key: "NUMBERS",          label: "Numbers",          emoji: "🔢" },
    { key: "ARABIC_ALPHABET",  label: "Arabic Alphabet",  emoji: "ا" },
    { key: "ENGLISH_ALPHABET", label: "English Alphabet", emoji: "A" },
    { key: "CONVERSATION",     label: "Conversation",     emoji: "💬" },
    { key: "EMOTIONS",         label: "Emotions",         emoji: "😊" },
    { key: "COMMUNICATION",    label: "Communication",    emoji: "🗣️" },
];

// ==========================================
// Get all categories
// ==========================================
export const getCategories = async () => {
    return ALL_CATEGORIES;
};

// ==========================================
// Get items by category
// ==========================================
export const getItemsByCategory = async (category: string) => {
    if (!Object.values(LearningCategory).includes(category as LearningCategory)) {
        throw Object.assign(new Error("Invalid category"), { status: 400 });
    }

    const items = await prisma.learningItem.findMany({
        where: { category: category as LearningCategory },
        select: {
            id: true,
            category: true,
            title: true,
            imageUrl: true,
            audioUrl: true,
            phrases: true,
            sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
    });

    return items;
};

// ==========================================
// Get single item
// ==========================================
export const getItemById = async (itemId: string) => {
    const item = await prisma.learningItem.findUnique({
        where: { id: itemId },
        select: {
            id: true,
            category: true,
            title: true,
            imageUrl: true,
            audioUrl: true,
            phrases: true,
            sortOrder: true,
        },
    });

    if (!item) {
        throw Object.assign(new Error("Item not found"), { status: 404 });
    }

    return item;
};

// ==========================================
// Log learning (child viewed item)
// ==========================================
export const logLearning = async (childId: string, itemId: string) => {
    const item = await prisma.learningItem.findUnique({
        where: { id: itemId },
        select: { id: true },
    });

    if (!item) {
        throw Object.assign(new Error("Item not found"), { status: 404 });
    }

    await prisma.learningLog.create({
        data: { childId, itemId },
    });

    // ✅ اضف نجمة للطفل عند كل تعلم
    await addStarToChild(childId, 1);

    return { ok: true, message: "Learning logged successfully" };
};

// ==========================================
// Helper: Add stars to child
// ==========================================
export const addStarToChild = async (childId: string, stars: number) => {
    await prisma.reward.upsert({
        where: { childId },
        create: {
            childId,
            stars,
            totalStars: stars,
            level: 1,
        },
        update: {
            stars: { increment: stars },
            totalStars: { increment: stars },
        },
    });
};