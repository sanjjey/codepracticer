import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { executeCodeJDoodle } from "./jdoodle";
import { executeCode } from "./judge0";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  isError: boolean;
}

export async function smartExecute(
  sourceCode: string, 
  language: string, 
  stdin: string, 
  judge0Key?: string
): Promise<ExecutionResult> {
  const isLocal = !process.env.VERCEL && process.env.NODE_ENV !== "production";
  const isJDoodleConfigured = process.env.JDOODLE_CLIENT_ID && process.env.JDOODLE_CLIENT_SECRET;

  if (isLocal) {
    const tempDir = path.join(process.cwd(), "temp_execution");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const id = Math.random().toString(36).substring(7);
    let fileName = "";
    let runCommand = "";

    // Map language to extension and command
    if (language === "javascript" || language === "typescript") {
      fileName = `solution_${id}.js`;
      fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
      runCommand = `node "${path.join(tempDir, fileName)}"`;
    } else if (language === "python") {
      fileName = `solution_${id}.py`;
      fs.writeFileSync(path.join(tempDir, fileName), sourceCode);
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
    } else {
      throw new Error(`Language ${language} not supported for local execution`);
    }

    try {
      const stdout = execSync(runCommand, {
        input: stdin,
        timeout: 5000,
        encoding: "utf-8"
      });
      return { stdout: stdout.trim(), stderr: "", isError: false };
    } catch (err: any) {
      return { 
        stdout: err.stdout?.toString() || "", 
        stderr: err.stderr?.toString() || err.message, 
        isError: true 
      };
    } finally {
      if (fs.existsSync(path.join(tempDir, fileName))) {
        fs.unlinkSync(path.join(tempDir, fileName));
      }
    }
  } else if (isJDoodleConfigured) {
    const result = await executeCodeJDoodle(sourceCode, language, stdin);
    return {
      stdout: result.output.trim(),
      stderr: result.statusCode !== 200 ? "JDoodle Error" : "",
      isError: result.statusCode !== 200
    };
  } else {
    const result = await executeCode(sourceCode, language, stdin, judge0Key);
    return {
      stdout: (result.stdout || "").trim(),
      stderr: (result.stderr || result.compile_output || "").trim(),
      isError: result.status.id !== 3
    };
  }
}
