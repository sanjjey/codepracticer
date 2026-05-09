"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Code2, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProblems(data);
      }
      setLoading(false);
    };

    fetchProblems();
  }, []);

  const handleSelectProblem = (problem: any) => {
    sessionStorage.setItem("currentProblem", JSON.stringify(problem));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">Problem <span className="text-gradient">Library</span></h1>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-zinc-500">Retrieving challenges...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {problems.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-3xl">
                <p className="text-zinc-500">No problems generated yet. Go to the home page to start!</p>
              </div>
            ) : (
              problems.map((p, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={p.id}
                >
                  <Link
                    href="/workspace"
                    onClick={() => handleSelectProblem(p)}
                    className="group flex items-center justify-between p-6 glass-panel rounded-2xl hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                        <Code2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-white transition-colors">{p.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            p.difficulty === "Hard" ? "bg-rose-500/10 text-rose-500" :
                            p.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" :
                            "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {p.difficulty}
                          </span>
                          <span className="text-xs text-zinc-500">Generated on {new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
