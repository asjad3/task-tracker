import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY;
// Initialize carefully
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeTaskScope = async (
  title: string,
  description: string
): Promise<AIAnalysisResult | null> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      You are an expert academic planner. 
      Analyze the following university task.
      
      Task Title: ${title}
      Task Description: ${description}

      Please provide:
      1. A list of actionable subtasks (checklist) to complete this.
      2. An estimated time to complete (e.g. "2 hours", "3 days").
      3. A difficulty rating (Low, Medium, High).
      4. A one sentence summary of the core objective.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of granular steps to complete the task"
            },
            estimatedTime: {
              type: Type.STRING,
              description: "Estimated duration"
            },
            difficultyRating: {
              type: Type.STRING,
              description: "Low, Medium, or High"
            },
            summary: {
              type: Type.STRING,
              description: "Concise summary of the goal"
            }
          },
          required: ["subtasks", "estimatedTime", "difficultyRating", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Error analyzing task with Gemini:", error);
    return null;
  }
};