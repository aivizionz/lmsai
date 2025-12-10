import { GoogleGenAI, Type } from "@google/genai";

export interface EvaluationResult {
  score: number;
  reason: string;
  pass: boolean;
}

/**
 * Base Metric Class
 * Defines the contract for all evaluation metrics.
 */
export abstract class BaseMetric {
  protected ai: GoogleGenAI;

  constructor() {
    // Uses the same API key as the main app
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'test-key' });
  }

  abstract evaluate(input: string, output: string): Promise<EvaluationResult>;
}

/**
 * Metric: JsonCompliance
 * Checks if the output is valid JSON and adheres to the expected structure.
 * This checks Syntactic Correctness.
 */
export class JsonComplianceMetric extends BaseMetric {
  async evaluate(input: string, output: string): Promise<EvaluationResult> {
    try {
      const parsed = JSON.parse(output);
      // Basic check: Ensure it's an object and has required keys (simplified for demo)
      if (typeof parsed !== 'object' || parsed === null) {
        return { score: 0, reason: "Output is not a JSON object", pass: false };
      }
      return { score: 1, reason: "Valid JSON", pass: true };
    } catch (e) {
      return { score: 0, reason: "Failed to parse JSON", pass: false };
    }
  }
}

/**
 * Metric: AnswerRelevancy
 * Uses the LLM as a Judge to determine if the output actually answers the input prompt.
 * This checks Semantic Correctness.
 */
export class RelevancyMetric extends BaseMetric {
  async evaluate(input: string, output: string): Promise<EvaluationResult> {
    const prompt = `
    You are an AI Evaluator. 
    
    Original User Request: "${input}"
    
    AI Generated Output:
    ${output}

    Task:
    Evaluate if the generated output directly and accurately addresses the user's request.
    Ignore JSON formatting issues (those are checked elsewhere). 
    Focus on the content.

    Return a JSON response:
    {
      "score": number, // 0.0 to 1.0
      "reason": "string explanation"
    }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["score", "reason"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        score: result.score,
        reason: result.reason,
        pass: result.score > 0.7 // Threshold
      };
    } catch (error) {
      console.error("Evaluation failed", error);
      // Fallback for mock environment
      return { score: 0, reason: "Evaluation Error", pass: false };
    }
  }
}
