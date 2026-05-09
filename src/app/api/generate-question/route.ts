import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { groq, CHAT_MODELS, Problem } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { smartExecute } from "@/lib/execution";

export async function POST(req: NextRequest) {
  try {
    const { input, testCaseCount = 5, isCombined = false, isTagBased = false, cycle = 1 } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    let systemContext = "You are a world-class Competitive Programming coach.";
    let mainTask = `Frame the following raw input into a professional Competitive Programming challenge: "${input}"`;

    if (isCombined) {
      mainTask = `You are given multiple problems: "${input}". 
      Combine them into a SINGLE Competitive Programming challenge.`;
    }

    if (isTagBased) {
      mainTask = `Generate a Competitive Programming problem for Cycle ${cycle} with tags: ${input}.`;
    }

    const prompt = `
      ${mainTask}

      INPUT FORMAT REQUIREMENTS (CodeChef Style):
      1. The input must NOT contain brackets [] or commas ,.
      2. The first line of input should be the number of values (if an array is involved) or the primary variable.
      3. The second line should be the array elements separated by spaces.
      4. The third line should be any additional variables (like target sum, k, etc.).
      
      EXAMPLE INPUT FORMAT:
      5 (size of array)
      1 2 3 4 5 (array elements)
      9 (target)

      REQUIREMENTS:
      1. Frame the question properly with clear objectives.
      2. Provide detailed constraints.
      3. Generate ${testCaseCount} test cases in this clean CodeChef format.
      4. Determine difficulty (Easy, Medium, or Hard).
      5. Generate both a Brute Force solution and an Optimal solution (BOTH MUST BE IN PYTHON).
      6. Provide boilerplates that read input using stdin in the target language.

      OUTPUT FORMAT: You MUST return a JSON object strictly following this structure:
      {
        "title": "Problem Title",
        "description": "## Problem Description\\n...\\n\\n### Input Format\\n- The first line contains ...\\n- The second line contains ...\\n\\n### Output Format\\n- Print ...",
        "constraints": ["constraint 1", "constraint 2"],
        "inputExample": "5\\n1 2 3 4 5\\n9",
        "outputExample": "0 4",
        "explanation": "Brief logical explanation",
        "difficulty": "Easy | Medium | Hard",
        "optimalSolution": "python code string",
        "bruteForceSolution": "python code string",
        "boilerplates": {
          "python": "import sys\\ninput = sys.stdin.read().split()\\n# Your code here...",
          "javascript": "const fs = require('fs');\\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\\n// Your code here...",
          "java": "import java.util.*;\\npublic class Solution {\\n  public static void main(String[] args) {\\n    Scanner sc = new Scanner(System.in);\\n    // Your code here...\\n  }\\n}",
          "cpp": "#include <iostream>\\nusing namespace std;\\nint main() {\\n  // Your code here...\\n  return 0;\\n}"
        },
        "testCases": [
          { "input": "...", "expectedOutput": "...", "isEdgeCase": boolean }
        ]
      }
    `;

    const userGroqKey = req.headers.get("x-user-groq-key");
    const groqClient = userGroqKey ? new Groq({ apiKey: userGroqKey }) : groq;

    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: CHAT_MODELS.REASONING,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    const problem: Problem = JSON.parse(responseContent);

    // --- AUTO-VERIFICATION STEP ---
    // Use the generated optimal solution to verify/fix test case outputs
    const userJudge0Key = req.headers.get("x-user-judge0-key") || undefined;
    
    // We only verify the first few test cases to keep latency low, or all if preferred
    const verifiedTestCases = await Promise.all(
      problem.testCases.map(async (tc) => {
        try {
          const { stdout, isError } = await smartExecute(
            problem.optimalSolution,
            "python", // Most AI solutions are Python by default in our prompt, or we can detect
            tc.input,
            userJudge0Key
          );
          if (!isError && stdout) {
            return { ...tc, expectedOutput: stdout };
          }
        } catch (e) {
          console.warn("Verification failed for a test case, using AI default", e);
        }
        return tc;
      })
    );
    problem.testCases = verifiedTestCases;

    // Calculate lockout duration in minutes
    const durationMins = problem.difficulty === "Hard" ? 30 : problem.difficulty === "Medium" ? 15 : 5;
    const unlockAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    // Try to save to Supabase if configured
    let problemId = Math.random().toString(36).substring(7); // Fallback ID
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { data, error } = await supabase
        .from("problems")
        .insert({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          constraints: problem.constraints,
          input_example: problem.inputExample,
          output_example: problem.testCases[0]?.expectedOutput || problem.outputExample,
          explanation: problem.explanation,
          optimal_solution: problem.optimalSolution,
          brute_force_solution: problem.bruteForceSolution,
          test_cases: problem.testCases,
          boilerplates: problem.boilerplates,
          unlock_at: unlockAt,
        })
        .select()
        .single();

      if (!error && data) {
        problemId = data.id;
      } else {
        console.warn("Supabase insert failed:", error);
      }
    }

    // Secure the response: Remove solutions before sending to client
    const { optimalSolution, bruteForceSolution, ...publicProblem } = problem;

    return NextResponse.json({
      ...publicProblem,
      id: problemId,
      unlockAt
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
