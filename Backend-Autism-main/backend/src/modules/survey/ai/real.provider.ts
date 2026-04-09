import { AiProvider, AiAssessmentInput, SurveyAssessment } from "./ai.provider";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        const prompt = `
You are an autism screening assistant. Based on the following answers from an autism screening questionnaire, provide a risk assessment.

Answers:
- A1 (responds to name): ${answers.A1_Score}
- A2 (makes eye contact): ${answers.A2_Score}
- A3 (points to show interest): ${answers.A3_Score}
- A4 (follows gaze): ${answers.A4_Score}
- A5 (pretend play): ${answers.A5_Score}
- A6 (echolalia): ${answers.A6_Score}
- A7 (prefers alone): ${answers.A7_Score}
- A8 (repetitive movements): ${answers.A8_Score}
- A9 (interest in other children): ${answers.A9_Score}
- A10 (responds to smile): ${answers.A10_Score}
- Total score: ${result}/10
- Age: ${answers.age}
- Gender: ${answers.gender}
- Jaundice history: ${answers.jaundice}
- Family autism history: ${answers.autism}

Respond ONLY with a JSON object, no markdown, no explanation:
{
  "probability": <number between 0 and 1>,
  "prediction": <1 for Autistic, 0 for Non-Autistic>
}
`;

        const chat = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        const text = chat.choices[0]?.message?.content ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(clean);

        const probability = Number(data.probability);
        const riskLevel =
            probability >= 0.75 ? "HIGH" :
            probability >= 0.5  ? "MEDIUM" : "LOW";

        return {
            probability,
            riskLevel,
            confidence: probability,
            summary: `Prediction: ${data.prediction === 1 ? "Autistic" : "Non-Autistic"}, Probability: ${Math.round(probability * 100)}%`,
            modelName: "llama3-groq",
            modelVersion: "1.0",
        };
    },
};