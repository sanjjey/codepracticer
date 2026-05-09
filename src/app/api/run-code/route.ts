import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { sourceCode, language = "typescript", testCases } = await req.json();

    if (!sourceCode || !testCases) {
      return NextResponse.json({ error: "Missing source code or test cases" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), "temp_execution");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const results = [];

    for (const testCase of testCases) {
      const id = Date.now() + Math.random().toString(36).substring(7);
      let fileName = "";
      let runCommand = "";

      // Setup language-specific execution
      if (language === "javascript" || language === "typescript") {
        fileName = `solution_${id}.js`;
        fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
        runCommand = `node ${path.join(tempDir, fileName)}`;
      } else if (language === "python") {
        fileName = `solution_${id}.py`;
        fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
        runCommand = `python "${path.join(tempDir, fileName)}"`;
      } else if (language === "java") {
        fileName = `Solution_${id}.java`;
        // Basic Java 11+ single-file execution
        fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
        runCommand = `java "${path.join(tempDir, fileName)}"`;
      } else {
        throw new Error(`Language ${language} not supported for local execution yet.`);
      }

      try {
        const stdout = execSync(runCommand, {
          input: testCase.input,
          timeout: 2000,
          encoding: "utf-8"
        });

        const isCorrect = stdout.trim() === testCase.expectedOutput?.trim();
        
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: stdout,
          status: "Success",
          isCorrect,
          isEdgeCase: testCase.isEdgeCase,
        });
      } catch (err: any) {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: err.stdout?.toString(),
          status: "Error",
          isCorrect: false,
          isEdgeCase: testCase.isEdgeCase,
          error: err.stderr?.toString() || err.message
        });
      } finally {
        if (fs.existsSync(path.join(tempDir, fileName))) {
          fs.unlinkSync(path.join(tempDir, fileName));
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Local Execution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
