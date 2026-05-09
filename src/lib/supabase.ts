import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Persistent features will be disabled.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProblemRow = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  difficulty: string;
  constraints: string[];
  input_example: string;
  output_example: string;
  explanation: string;
  optimal_solution: string;
  brute_force_solution: string;
  test_cases: any;
  unlock_at: string;
};
