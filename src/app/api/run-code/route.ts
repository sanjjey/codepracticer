import { NextRequest, NextResponse } from "next/server";
import { smartExecute } from "@/lib/execution";

export async function POST(req: NextRequest) {
  try {
    const { sourceCode, language = "typescript", testCases } = await req.json();

    if (!sourceCode || !testCases) {
      return NextResponse.json({ error: "Missing source code or test cases" }, { status: 400 });
    }

    const userJudge0Key = req.headers.get("x-user-judge0-key") || undefined;
    const results = [];

    for (const testCase of testCases) {
      try {
        const { stdout, stderr, isError } = await smartExecute(sourceCode, language, testCase.input, userJudge0Key);
        
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: stdout,
          status: isError ? "Error" : "Success",
          isCorrect: !isError && stdout.trim() === testCase.expectedOutput?.trim(),
          isEdgeCase: testCase.isEdgeCase,
          error: isError ? stderr || "Execution Error" : undefined
        });
      } catch (err: any) {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: null,
          status: "Error",
          isCorrect: false,
          isEdgeCase: testCase.isEdgeCase,
          error: err.message
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Execution API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


