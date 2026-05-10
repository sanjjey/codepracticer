import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { groq, CHAT_MODELS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { problemDescription, currentCode, language } = await req.json();

    if (!problemDescription) {
      return NextResponse.json({ error: "Problem description is required" }, { status: 400 });
    }

    const prompt = `
      You are an expert DSA coach. A student is working on the following problem:
      
      PROBLEM DESCRIPTION:
      ${problemDescription}
      
      STUDENT'S CURRENT CODE (${language}):
      ${currentCode || "// No code yet"}
      
      Provide a brief, high-level hint to guide the student. 
      - Do NOT provide the full solution.
      - Focus on the logic or a common pitfall.
      - Keep it under 3 sentences.
    `;

    const userGroqKey = req.headers.get("x-user-groq-key");
    const groqClient = userGroqKey ? new Groq({ apiKey: userGroqKey }) : groq;

    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful DSA coach giving brief, insightful hints.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: CHAT_MODELS.FAST,
    });

    const hint = completion.choices[0]?.message?.content;

    return NextResponse.json({ hint });
  } catch (error: any) {
    console.error("Hint API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
