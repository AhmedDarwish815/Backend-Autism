import { prisma } from "../../config/prisma";
import { realAiProvider } from "./ai/real.provider";

const ai = realAiProvider;

const ensureParentOwnsChild = async (parentId: string, childId: string) => {
    const child = await prisma.user.findFirst({
        where: { id: childId, parentId, role: "CHILD" },
        select: { id: true },
    });
    if (!child) throw Object.assign(new Error("Child not found"), { status: 404 });
};

export const submitSurvey = async (parentId: string, childId: string, answers: any) => {
    if (!childId) throw Object.assign(new Error("childId is required"), { status: 400 });
    if (!answers)  throw Object.assign(new Error("answers is required"),  { status: 400 });

    await ensureParentOwnsChild(parentId, childId);

    const response = await prisma.surveyResponse.create({
        data: { childId, answers },
        select: { id: true, createdAt: true },
    });

    const assessment = await ai.assess({ childId, answers });

    await prisma.assessmentResult.create({
        data: {
            surveyResponseId: response.id,
            probability:  assessment.probability,
            riskLevel:    assessment.riskLevel,
            confidence:   assessment.confidence,
            summary:      assessment.summary,
            modelName:    assessment.modelName,
            modelVersion: assessment.modelVersion,
        },
    });

    return { surveyResponseId: response.id, assessment };
};

export const getSurveyStatusForChild = async (parentId: string, childId: string) => {
    await ensureParentOwnsChild(parentId, childId);

    const latest = await prisma.assessmentResult.findFirst({
        where: { surveyResponse: { childId } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true, probability: true, riskLevel: true,
            confidence: true, summary: true, modelName: true,
            modelVersion: true, createdAt: true, surveyResponseId: true,
        },
    });

    if (!latest) return { needsSurvey: true, latestAssessment: null };
    return { needsSurvey: false, latestAssessment: latest };
};

export const getLatestAssessmentForChild = async (parentId: string, childId: string) => {
    if (!childId) throw Object.assign(new Error("childId is required"), { status: 400 });

    await ensureParentOwnsChild(parentId, childId);

    const latest = await prisma.assessmentResult.findFirst({
        where: { surveyResponse: { childId } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true, probability: true, riskLevel: true,
            confidence: true, summary: true, modelName: true,
            modelVersion: true, createdAt: true, surveyResponseId: true,
        },
    });

    return { latestAssessment: latest };
};