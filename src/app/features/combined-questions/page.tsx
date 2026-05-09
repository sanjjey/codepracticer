"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Combine, Sparkles, Loader2, Link2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function CombinedQuestionsPage() {
  const [questions, setQuestions] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddQuestion = () => setQuestions([...questions, ""]);
  
  const handleGenerate = async () => {
    if (questions.some(q => !q.trim())) return;
    setIsLoading(true);

    try {
      // We use the same generation endpoint but with a different prompt type
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          input: `Combine these problems logically: ${questions.join(" | ")}`,
          isCombined: true 
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const problem = await response.json();
      sessionStorage.setItem("currentProblem", JSON.stringify(problem));
      router.push("/workspace");
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-purple-500/10 text-purple-400 mb-4">
            <Combine size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Combined_questions</h1>
          <p className="text-zinc-500 text-lg">
            Fuse multiple problems into a single master challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q, i) => (
            <div key={i} className="glass-panel p-6 rounded-[2rem] space-y-4 relative group">
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <Link2 size={14} />
                Question {i + 1}
              </div>
              <textarea
                className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-100 focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all"
                placeholder="Paste link or question text here..."
                value={q}
                onChange={(e) => {
                  const newQ = [...questions];
                  newQ[i] = e.target.value;
                  setQuestions(newQ);
                }}
              />
            </div>
          ))}

          <button 
            onClick={handleAddQuestion}
            className="h-full min-h-[10rem] border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all gap-2"
          >
            <Plus size={32} />
            <span className="font-bold">Add Another Question</span>
          </button>
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={handleGenerate}
            disabled={isLoading || questions.some(q => !q.trim())}
            className="px-12 py-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-2xl font-bold transition-all flex items-center gap-3 glow-button"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Synthesize Challenge
                <Sparkles size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
