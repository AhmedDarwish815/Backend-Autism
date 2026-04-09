import { prisma } from "../../config/prisma";

// الحصول على المقالات
export const getArticles = async (filters?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
}) => {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const where: any = {};

    if (filters?.category) {
        where.category = filters.category;
    }

    if (filters?.featured) {
        where.featured = true;
    }

    const articles = await prisma.article.findMany({
        where,
        select: {
            id: true,
            title: true,
            excerpt: true,
            imageUrl: true,
            category: true,
            tags: true,
            author: true,
            featured: true,
            publishedAt: true,
        },
        orderBy: [
            { featured: "desc" },
            { publishedAt: "desc" },
        ],
        take: limit,
        skip: offset,
    });

    return articles;
};

// الحصول على مقال واحد
export const getArticleById = async (articleId: string) => {
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: {
            id: true,
            title: true,
            content: true,
            excerpt: true,
            imageUrl: true,
            category: true,
            tags: true,
            author: true,
            source: true,
            sourceUrl: true,
            featured: true,
            publishedAt: true,
        },
    });

    if (!article) {
        throw Object.assign(new Error("Article not found"), { status: 404 });
    }

    return article;
};