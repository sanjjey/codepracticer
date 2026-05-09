import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "";

if (!apiKey && process.env.NODE_ENV !== "production") {
  console.warn("Missing GROQ_API_KEY environment variable");
}

export const groq = new Groq({
  apiKey: apiKey || "dummy-key-for-build",
});

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  title: string;
  description: string;
  constraints: string[];
  inputExample: string;
  outputExample: string;
  explanation: string;
  difficulty: Difficulty;
  optimalSolution: string;
  bruteForceSolution: string;
  boilerplates: Record<string, string>;
  testCases: {
    input: string;
    expectedOutput: string;
    isEdgeCase: boolean;
  }[];
}

export const CHAT_MODELS = {
  REASONING: "llama-3.3-70b-versatile",
  FAST: "llama-3.1-8b-instant",
};
