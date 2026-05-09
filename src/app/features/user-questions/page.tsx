"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserQuestionsPage() {
  const [input, setInput] = useState("");
  const [testCaseCount, setTestCaseCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, testCaseCount }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const problem = await response.json();
      
      // Store problem in session storage to pass to workspace
      sessionStorage.setItem("currentProblem", JSON.stringify(problem));
      router.push("/workspace");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-blue-500/10 text-blue-400 mb-4">
            <Brain size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">User_questions</h1>
          <p className="text-zinc-500 text-lg">
            Paste a raw problem, a snippet, or just a concept. AI will handle the rest.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Problem Description</label>
            <textarea
              className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Example: Given an array of integers, return the indices of the two numbers that add up to a specific target..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full space-y-2">
              <label className="text-sm font-medium text-zinc-400">Test Cases: {testCaseCount}</label>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={testCaseCount}
                onChange={(e) => setTestCaseCount(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Generate Challenge
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Automatic Formatting
          </div>
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Edge-Case Prioritization
          </div>
        </div>
      </motion.div>
    </div>
  );
}
