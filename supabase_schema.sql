-- Run this in your Supabase SQL Editor to create the necessary table

CREATE TABLE IF NOT EXISTS public.problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
    input_example TEXT NOT NULL,
    output_example TEXT NOT NULL,
    explanation TEXT,
    optimal_solution TEXT,
    brute_force_solution TEXT,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    boilerplates JSONB NOT NULL DEFAULT '{}'::jsonb,
    unlock_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) if needed
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so anyone can view the problems)
CREATE POLICY "Allow public read access on problems" 
ON public.problems FOR SELECT 
USING (true);

-- Allow public insert access (since the API inserts problems server-side or directly)
-- Note: If you want to restrict inserts strictly to your API, you could rely on the Service Role key 
-- or restrict this policy, but for local testing / direct client insertion, this allows it:
CREATE POLICY "Allow public insert access on problems" 
ON public.problems FOR INSERT 
WITH CHECK (true);
