import { NextRequest, NextResponse } from "next/server";
import { executeCodeJDoodle } from "@/lib/jdoodle";
import { executeCode } from "@/lib/judge0";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const { sourceCode, language = "typescript", testCases } = await req.json();

    if (!sourceCode || !testCases) {
      return NextResponse.json({ error: "Missing source code or test cases" }, { status: 400 });
    }

    const results = [];
    
    // Check if we are running in a local development environment
    // Vercel sets the VERCEL environment variable
    const isLocal = !process.env.VERCEL && process.env.NODE_ENV !== "production";
    
    const isJDoodleConfigured = process.env.JDOODLE_CLIENT_ID && process.env.JDOODLE_CLIENT_SECRET;
    const userJudge0Key = req.headers.get("x-user-judge0-key") || undefined;

    for (const testCase of testCases) {
      try {
        let stdout = "";
        let stderr = "";
        let isRuntimeError = false;

        if (isLocal) {
          // --- LOCAL EXECUTION LOGIC ---
          const tempDir = path.join(process.cwd(), "temp_execution");
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
          
          const id = Math.random().toString(36).substring(7);
          let fileName = "";
          let runCommand = "";

          if (language === "javascript" || language === "typescript") {
            fileName = `solution_${id}.js`;
            fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
            runCommand = `node "${path.join(tempDir, fileName)}"`;
          } else if (language === "python") {
            fileName = `solution_${id}.py`;
            fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
            // Try 'python' then 'python3'
            try {
              runCommand = `python "${path.join(tempDir, fileName)}"`;
              execSync("python --version", { stdio: "ignore" });
            } catch {
              runCommand = `python3 "${path.join(tempDir, fileName)}"`;
            }
          } else if (language === "java") {
            fileName = `Solution_${id}.java`;
            fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
            runCommand = `java "${path.join(tempDir, fileName)}"`;
          }

          try {
            stdout = execSync(runCommand, {
              input: testCase.input,
              timeout: 3000,
              encoding: "utf-8"
            });
          } catch (err: any) {
            isRuntimeError = true;
            stderr = err.stderr?.toString() || err.message;
            stdout = err.stdout?.toString() || "";
          } finally {
            if (fs.existsSync(path.join(tempDir, fileName))) {
              fs.unlinkSync(path.join(tempDir, fileName));
            }
          }
        } else if (isJDoodleConfigured) {
          // --- CLOUD FALLBACK (JDOODLE) ---
          const result = await executeCodeJDoodle(sourceCode, language, testCase.input);
          stdout = result.output;
          isRuntimeError = result.statusCode !== 200;
        } else {
          // --- CLOUD FALLBACK (JUDGE0) ---
          const result = await executeCode(sourceCode, language, testCase.input, userJudge0Key);
          stdout = result.stdout || "";
          stderr = result.stderr || result.compile_output || "";
          isRuntimeError = result.status.id !== 3;
        }
        
        const isCorrect = !isRuntimeError && stdout.trim() === testCase.expectedOutput?.trim();
        
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: stdout,
          status: isRuntimeError ? "Error" : "Success",
          isCorrect,
          isEdgeCase: testCase.isEdgeCase,
          error: isRuntimeError ? stderr || "Execution Error" : undefined
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

