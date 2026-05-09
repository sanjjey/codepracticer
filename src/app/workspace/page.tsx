"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Send, 
  Clock, 
  ChevronLeft, 
  HelpCircle, 
  Trophy, 
  Lock, 
  Unlock,
  AlertCircle,
  Loader2,
  Menu,
  X,
  Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Problem } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/apiFetch";

export default function WorkspacePage() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("// Write your code here...");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [solutions, setSolutions] = useState<{ optimal: string, brute: string } | null>(null);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"desc" | "hints" | "results" | "solutions">("desc");
  const [selectedLanguage, setSelectedLanguage] = useState("typescript");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [problemList, setProblemList] = useState<any[]>([]);

  const LANGUAGES_MAP = [
    { label: "TypeScript", value: "typescript", monaco: "typescript" },
    { label: "JavaScript", value: "javascript", monaco: "javascript" },
    { label: "Python", value: "python", monaco: "python" },
    { label: "Java", value: "java", monaco: "java" },
    { label: "C++", value: "cpp", monaco: "cpp" },
  ];

  const fetchProblems = async () => {
    const { data } = await supabase.from("problems").select("*").order("created_at", { ascending: false });
    if (data) setProblemList(data);
  };

  const switchProblem = (p: any) => {
    setProblem(p);
    setProblemId(p.id);
    sessionStorage.setItem("currentProblem", JSON.stringify(p));
    setIsMenuOpen(false);
    // Reset state
    setSolutions(null);
    setExecutionResults([]);
    setIsLocked(true);
    
    const unlockAt = new Date(p.unlock_at || p.unlockAt).getTime();
    const now = new Date().getTime();
    setTimeLeft(Math.max(0, Math.floor((unlockAt - now) / 1000)));

    if (p.boilerplates && p.boilerplates[selectedLanguage]) {
      setCode(p.boilerplates[selectedLanguage]);
    }
  };

  useEffect(() => {
    if (isMenuOpen) fetchProblems();
  }, [isMenuOpen]);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentProblem");
    if (stored) {
      const p = JSON.parse(stored);
      setProblem(p);
      setProblemId(p.id);
      
      // Load initial boilerplate
      if (p.boilerplates && p.boilerplates[selectedLanguage]) {
        setCode(p.boilerplates[selectedLanguage]);
      } else if (p.boilerplates && p.boilerplates["javascript"]) {
        setCode(p.boilerplates["javascript"]);
      }

      const unlockAt = new Date(p.unlock_at || p.unlockAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((unlockAt - now) / 1000));
      setTimeLeft(diff);
    }
  }, []);

  // Update code when language changes if it's still just the boilerplate
  useEffect(() => {
    if (problem?.boilerplates && problem.boilerplates[selectedLanguage]) {
      setCode(problem.boilerplates[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const handleViewSolution = async () => {
    if (isLocked) return;
    try {
      const response = await apiFetch("/api/reveal-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSolutions({ optimal: data.optimalSolution, brute: data.bruteForceSolution });
      setActiveTab("solutions");
    } catch (err) {
      alert("Failed to fetch solution.");
    }
  };

  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunCode = async () => {
    if (!problem) return;
    setIsExecuting(true);
    setActiveTab("results");
    
    try {
      const response = await apiFetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          language: selectedLanguage,
          testCases: problem.testCases || (problem as any).test_cases
        }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setExecutionResults(data.results);
    } catch (err) {
      alert("Execution failed. Check your local dev server.");
    } finally {
      setIsExecuting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!problem) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-zinc-950 border-r border-zinc-800 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Library className="text-blue-500" size={20} />
                  <h2 className="font-bold text-lg">Problems</h2>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {problemList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => switchProblem(p)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${p.id === problemId ? "bg-blue-500/10 border-blue-500/50" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"}`}
                  >
                    <h3 className={`font-bold text-sm ${p.id === problemId ? "text-blue-400" : "text-zinc-200"}`}>{p.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        p.difficulty === "Hard" ? "text-rose-500 bg-rose-500/10" :
                        p.difficulty === "Medium" ? "text-amber-500 bg-amber-500/10" :
                        "text-emerald-400 bg-emerald-400/10"
                      }`}>{p.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-bold text-zinc-200">{problem.title}</h1>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            problem.difficulty === "Hard" ? "bg-rose-500/10 text-rose-500" :
            problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" :
            "bg-emerald-500/10 text-emerald-500"
          }`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <Clock size={16} className={timeLeft > 0 ? "text-blue-400" : "text-emerald-400"} />
            <span className={`font-mono font-bold ${timeLeft > 0 ? "text-blue-400" : "text-emerald-400"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all flex items-center gap-2">
            <Send size={16} />
            Submit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Description */}
        <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950/20">
          <div className="flex border-b border-zinc-800">
            <button 
              onClick={() => setActiveTab("desc")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "desc" ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab("hints")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "hints" ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              AI Hints
            </button>
            <button 
              onClick={() => setActiveTab("results")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "results" ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Results
            </button>
            {solutions && (
              <button 
                onClick={() => setActiveTab("solutions")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === "solutions" ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Solutions
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeTab === "desc" ? (
              <>
                <div className="prose prose-invert max-w-none">
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {problem.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} className="text-blue-400" />
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-zinc-400">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle size={14} className="text-purple-400" />
                    Example
                  </h3>
                  <div className="bg-zinc-900 rounded-xl p-4 space-y-2 border border-zinc-800 font-mono text-sm">
                    <div>
                      <span className="text-zinc-500 font-bold">Input:</span> 
                      <code className="ml-2 text-zinc-300">{problem.inputExample}</code>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold">Output:</span> 
                      <code className="ml-2 text-zinc-300">{problem.outputExample}</code>
                    </div>
                    {problem.explanation && (
                      <div className="mt-2 text-zinc-500 italic">
                        // {problem.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : activeTab === "solutions" && solutions ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Optimal Solution</h3>
                   <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                     <pre className="text-xs text-zinc-300 overflow-x-auto"><code>{solutions.optimal}</code></pre>
                   </div>
                </div>
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Brute Force</h3>
                   <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                     <pre className="text-xs text-zinc-300 overflow-x-auto"><code>{solutions.brute}</code></pre>
                   </div>
                </div>
              </div>
            ) : activeTab === "results" ? (
              <div className="space-y-6">
                {isExecuting ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-sm text-zinc-500">Running code against {problem.testCases.length} test cases...</p>
                  </div>
                ) : executionResults.length > 0 ? (
                  <div className="space-y-4">
                    {executionResults.map((res, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${res.isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Test Case {i+1} {res.isEdgeCase && "(Edge Case)"}</span>
                           <span className={`text-xs font-bold ${res.isCorrect ? "text-emerald-500" : "text-rose-500"}`}>
                             {res.isCorrect ? "PASSED" : "FAILED"}
                           </span>
                         </div>
                         {!res.isCorrect && (
                           <div className="text-xs space-y-1 font-mono">
                             <div className="text-zinc-500">Expected: <span className="text-zinc-300">{res.expected}</span></div>
                             <div className="text-zinc-500">Actual: <span className="text-zinc-300">{res.actual || "No Output"}</span></div>
                             {res.error && <div className="text-rose-400 mt-2 bg-rose-500/10 p-2 rounded">{res.error}</div>}
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Play size={48} className="text-zinc-800" />
                    <p className="text-sm text-zinc-500">Run your code to see results here.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                <HelpCircle size={48} className="text-zinc-800" />
                <h3 className="text-lg font-bold">Stuck?</h3>
                <p className="text-zinc-500 text-sm">
                  The AI is currently analyzing your approach. Hints will appear here as you code.
                </p>
                <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all">
                  Get a Hint
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Editor */}
        <div className="flex-1 flex flex-col relative">
          <div className="h-10 border-b border-zinc-800 bg-zinc-950/50 flex items-center px-4 justify-between">
            <div className="flex items-center gap-4">
               <div className="relative">
                  <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                  >
                    {LANGUAGES_MAP.find(l => l.value === selectedLanguage)?.label}
                    <ChevronLeft size={10} className={`transform transition-transform ${isLangOpen ? "rotate-90" : "-rotate-90"}`} />
                  </button>
                  
                  {isLangOpen && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
                      {LANGUAGES_MAP.map(lang => (
                        <button
                          key={lang.value}
                          onClick={() => {
                            setSelectedLanguage(lang.value);
                            setIsLangOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${selectedLanguage === lang.value ? "bg-blue-500/10 text-blue-400" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
               </div>
            </div>
            <button 
              onClick={handleRunCode}
              disabled={isExecuting}
              className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:text-blue-400 transition-colors disabled:opacity-50"
            >
              <Play size={12} />
              Run Code
            </button>
          </div>
          <div className="flex-1">
            <Editor
              theme="leetai-theme"
              language={selectedLanguage}
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                padding: { top: 20 },
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('leetai-theme', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#0a0a0a',
                  }
                });
              }}
            />
          </div>

          {/* Solution Lock Overlay */}
          <div className="h-14 border-t border-zinc-800 bg-zinc-950 flex items-center px-6 justify-between">
             <div className="flex items-center gap-2">
                {isLocked ? (
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                    <Lock size={14} />
                    Solution locked for {formatTime(timeLeft)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                    <Unlock size={14} />
                    Solution available
                  </div>
                )}
             </div>
             <button 
                disabled={isLocked}
                onClick={handleViewSolution}
                className="px-6 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all"
             >
               View Optimal Solution
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
