import { prisma } from "../../config/prisma";

export const createChatSession = async (
    userId: string,
    title?: string
) => {
    const session = await prisma.chatSession.create({
        data: {
            userId,
            title: title || "New Chat",
        },
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return session;
};

export const getChatSessions = async (
    userId: string,
    limit = 20,
    offset = 0
) => {
    const sessions = await prisma.chatSession.findMany({
        where: { userId },
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: { messages: true },
            },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
    });

    return sessions.map((session) => ({
        id: session.id,
        title: session.title,
        messagesCount: session._count.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    }));
};

export const getChatMessages = async (
    sessionId: string,
    userId: string,
    limit = 50,
    offset = 0
) => {
    const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        select: { id: true },
    });

    if (!session) {
        throw Object.assign(new Error("Chat session not found"), { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: offset,
    });

    return messages;
};

export const sendMessage = async (
    sessionId: string,
    userId: string,
    content: string
) => {
    if (!content || content.trim().length === 0) {
        throw Object.assign(new Error("Message content is required"), { status: 400 });
    }

    const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        select: { id: true },
    });

    if (!session) {
        throw Object.assign(new Error("Chat session not found"), { status: 404 });
    }

    const userMessage = await prisma.chatMessage.create({
        data: {
            sessionId,
            role: "user",
            content: content.trim(),
        },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        select: { role: true, content: true },
        orderBy: { createdAt: "asc" },
    });

    const formattedHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [msg.content],
    }));

    const aiServiceBaseUrl = process.env.AI_SERVICE_URL || "http://ai:5000";
    const chatEndpoint = `${aiServiceBaseUrl}/api/chat`;

    const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: content.trim(),
            session_id: sessionId,
            lang: "ar",
            history: formattedHistory,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("AI service chat error:", error);
        throw Object.assign(new Error("AI chat service error"), { status: 502 });
    }

    const data = await response.json() as any;

    const assistantMessage = await prisma.chatMessage.create({
        data: {
            sessionId,
            role: "assistant",
            content: data.reply,
        },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
    });

    return { userMessage, assistantMessage };
};



export const deleteChatSession = async (
    sessionId: string,
    userId: string
) => {
    const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        select: { id: true },
    });

    if (!session) {
        throw Object.assign(new Error("Chat session not found"), { status: 404 });
    }

    await prisma.chatSession.delete({
        where: { id: sessionId },
    });

    return { ok: true, message: "Chat session deleted successfully" };
};

export const sendVoiceMessage = async (
    sessionId: string,
    userId: string,
    audioBuffer: Buffer,
    filename: string
) => {
    const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        select: { id: true },
    });

    if (!session) {
        throw Object.assign(new Error("Chat session not found"), { status: 404 });
    }

    const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        select: { role: true, content: true },
        orderBy: { createdAt: "asc" },
    });

    const formattedHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [msg.content],
    }));

    const aiServiceBaseUrl = process.env.AI_SERVICE_URL || "http://ai:5000";
    const voiceEndpoint = `${aiServiceBaseUrl}/api/voice`;

    const formData = new FormData();
    const blob = new Blob([audioBuffer as any], { type: "audio/wav" });
    formData.append("audio", blob, filename);
    formData.append("session_id", sessionId);
    formData.append("lang", "ar");
    formData.append("history", JSON.stringify(formattedHistory));

    const response = await fetch(voiceEndpoint, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("AI service voice error:", error);
        throw Object.assign(new Error("AI voice service error"), { status: 502 });
    }

    const data = await response.json() as any;

    const userMessage = await prisma.chatMessage.create({
        data: {
            sessionId,
            role: "user",
            content: data.transcript || "🎤 رسالة صوتية",
        },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    const assistantMessage = await prisma.chatMessage.create({
        data: {
            sessionId,
            role: "assistant",
            content: data.reply,
        },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
    });

    return {
        userMessage,
        assistantMessage,
        reply_audio: data.audio, // Base64 audio string
    };
};