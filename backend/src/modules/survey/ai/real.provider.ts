import { AiProvider, AiAssessmentInput, SurveyAssessment } from "./ai.provider";

const FLASK_API_URL = process.env.AI_API_URL || "http://127.0.0.1:5000/predict";


interface FlaskResponse {
    prediction: number;
    probability: number;
    error?: string;
}

export const realAiProvider: AiProvider = {
    async assess({ childId, answers }: AiAssessmentInput): Promise<SurveyAssessment> {

        const result =
            Number(answers.A1_Score  ?? 0) +
            Number(answers.A2_Score  ?? 0) +
            Number(answers.A3_Score  ?? 0) +
            Number(answers.A4_Score  ?? 0) +
            Number(answers.A5_Score  ?? 0) +
            Number(answers.A6_Score  ?? 0) +
            Number(answers.A7_Score  ?? 0) +
            Number(answers.A8_Score  ?? 0) +
            Number(answers.A9_Score  ?? 0) +
            Number(answers.A10_Score ?? 0);

        const payload = {
            A1_Score:  Number(answers.A1_Score  ?? 0),
            A2_Score:  Number(answers.A2_Score  ?? 0),
            A3_Score:  Number(answers.A3_Score  ?? 0),
            A4_Score:  Number(answers.A4_Score  ?? 0),
            A5_Score:  Number(answers.A5_Score  ?? 0),
            A6_Score:  Number(answers.A6_Score  ?? 0),
            A7_Score:  Number(answers.A7_Score  ?? 0),
            A8_Score:  Number(answers.A8_Score  ?? 0),
            A9_Score:  Number(answers.A9_Score  ?? 0),
            A10_Score: Number(answers.A10_Score ?? 0),
            age:             Number(answers.age             ?? 5),
            gender:          answers.gender                ?? "m",
            ethnicity:       answers.ethnicity             ?? "White-European",
            jaundice:        answers.jaundice              ?? "no",
            autism:          answers.autism                ?? "no",
            Country_of_res:  answers.Country_of_res        ?? "United States",
            used_app_before: answers.used_app_before       ?? "no",
            result:          result, 
            relation:        answers.relation              ?? "Parent",
        };

        const response = await fetch(FLASK_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw Object.assign(new Error("AI service error"), { status: 502 });
        }

        const data = await response.json() as FlaskResponse;

        if (data.error) {
            throw Object.assign(new Error(data.error), { status: 502 });
        }

        const probability = data.probability / 100;
        const riskLevel =
            probability >= 0.75 ? "HIGH" :
            probability >= 0.5  ? "MEDIUM" : "LOW";

        return {
            probability,
            riskLevel,
            confidence: probability,
            summary: `Prediction: ${data.prediction === 1 ? "Autistic" : "Non-Autistic"}, Probability: ${data.probability}%`,
            modelName: "random-forest-autism",
            modelVersion: "1.0",
        };
    },
};