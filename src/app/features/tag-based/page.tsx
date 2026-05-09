"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tags, Sparkles, Loader2, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/apiFetch";

const TAGS = [
  "Arrays", "Strings", "Hash Table", "Dynamic Programming", 
  "Greedy", "Sorting", "Binary Search", "Tree", "Graph", 
  "Recursion", "Backtracking", "Two Pointers", "Sliding Window"
];

export default function TagBasedQuestionsPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cycle, setCycle] = useState(1);
  const router = useRouter();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async () => {
    if (selectedTags.length === 0) return;
    setIsLoading(true);

    try {
      const response = await apiFetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          input: `Generate a set of 5 questions for cycle ${cycle} with tags: ${selectedTags.join(", ")}. Difficulty should be increasing. Give me one of them now.`,
          isTagBased: true,
          cycle
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const problem = await response.json();
      sessionStorage.setItem("currentProblem", JSON.stringify(problem));
      setCycle(prev => prev + 1);
      router.push("/workspace");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-orange-500/10 text-orange-400 mb-4">
            <Tags size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Tag_based_questions</h1>
          <p className="text-zinc-500 text-lg">
            Choose your domains and progress through AI-curated cycles.
          </p>
        </div>

        <div className="glass-panel p-10 rounded-[3rem] space-y-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all ${
                  selectedTags.includes(tag) 
                    ? "bg-orange-500 border-orange-400 text-white" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-zinc-800 pt-10">
            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-orange-400" />
                <div>
                  <div className="text-xs text-zinc-500 font-bold uppercase">Current Cycle</div>
                  <div className="text-xl font-bold">Cycle {cycle}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-amber-400" />
                <div>
                  <div className="text-xs text-zinc-500 font-bold uppercase">Target</div>
                  <div className="text-xl font-bold">5 Problems</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || selectedTags.length === 0}
              className="px-10 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-2xl font-bold transition-all flex items-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Begin Cycle
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
