import { NextRequest, NextResponse } from "next/server";


import { executeCode } from "@/lib/judge0";

export async function POST(req: NextRequest) {
  try {
    const { sourceCode, language = "typescript", testCases } = await req.json();

    if (!sourceCode || !testCases) {
      return NextResponse.json({ error: "Missing source code or test cases" }, { status: 400 });
    }

    const results = [];

    for (const testCase of testCases) {
      try {
        const result = await executeCode(sourceCode, language, testCase.input);
        
        // Judge0 status id 3 is "Accepted"
        const isCompilationError = result.status.id === 6;
        const isRuntimeError = result.status.id >= 7 && result.status.id <= 12;
        
        const stdout = result.stdout || "";
        const isCorrect = !isCompilationError && !isRuntimeError && stdout.trim() === testCase.expectedOutput?.trim();
        
        if (isCompilationError) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: null,
            status: "Error",
            isCorrect: false,
            isEdgeCase: testCase.isEdgeCase,
            error: result.compile_output || result.message
          });
        } else if (isRuntimeError) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result.stdout,
            status: "Error",
            isCorrect: false,
            isEdgeCase: testCase.isEdgeCase,
            error: result.stderr || result.message
          });
        } else {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: stdout,
            status: "Success",
            isCorrect,
            isEdgeCase: testCase.isEdgeCase,
          });
        }
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
