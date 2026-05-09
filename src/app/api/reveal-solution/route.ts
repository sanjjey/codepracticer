import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { problemId } = await req.json();

    if (!problemId) {
      return NextResponse.json({ error: "Problem ID is required" }, { status: 400 });
    }

    const { data: problem, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .single();

    if (error || !problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const now = new Date();
    const unlockAt = new Date(problem.unlock_at);

    if (now < unlockAt) {
      const remaining = Math.ceil((unlockAt.getTime() - now.getTime()) / 1000);
      return NextResponse.json({ 
        error: "Solution is still locked", 
        remainingSeconds: remaining 
      }, { status: 403 });
    }

    return NextResponse.json({
      optimalSolution: problem.optimal_solution,
      bruteForceSolution: problem.brute_force_solution,
      explanation: problem.explanation
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
