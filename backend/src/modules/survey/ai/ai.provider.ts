export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type AiAssessmentInput = {
    childId: string;
    answers: Record<string, number> | any; // خليها any لو الـ answers مش ثابتة عندك
};

export type SurveyAssessment = {
    probability: number; // 0..1
    riskLevel: RiskLevel;
    confidence: number; // 0..1
    summary: string;
    modelName: string;
    modelVersion: string;
};

export interface AiProvider {
    assess(input: AiAssessmentInput): Promise<SurveyAssessment>;
}
