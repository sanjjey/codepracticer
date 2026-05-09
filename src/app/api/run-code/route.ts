import { NextRequest, NextResponse } from "next/server";


import { executeCodePiston } from "@/lib/piston";

export async function POST(req: NextRequest) {
  try {
    const { sourceCode, language = "typescript", testCases } = await req.json();

    if (!sourceCode || !testCases) {
      return NextResponse.json({ error: "Missing source code or test cases" }, { status: 400 });
    }

    const results = [];

    // Piston is more lenient with rate limits, but we'll still run them sequentially
    // to ensure clear output and avoid overloading the public instance.
    for (const testCase of testCases) {
      try {
        const result = await executeCodePiston(sourceCode, language, testCase.input);
        
        const stdout = result.run.stdout || "";
        const stderr = result.run.stderr || "";
        const isRuntimeError = result.run.code !== 0 || stderr.length > 0;
        
        const isCorrect = !isRuntimeError && stdout.trim() === testCase.expectedOutput?.trim();
        
        if (isRuntimeError) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: stdout,
            status: "Error",
            isCorrect: false,
            isEdgeCase: testCase.isEdgeCase,
            error: stderr || "Runtime Error"
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

