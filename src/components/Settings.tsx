"use client";

import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, X, Key, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [judge0Key, setJudge0Key] = useState("");

  useEffect(() => {
    // Load from local storage
    const savedGroq = localStorage.getItem("USER_GROQ_API_KEY") || "";
    const savedJudge = localStorage.getItem("USER_JUDGE0_API_KEY") || "";
    setGroqKey(savedGroq);
    setJudge0Key(savedJudge);
  }, []);

  const handleSave = () => {
    localStorage.setItem("USER_GROQ_API_KEY", groqKey.trim());
    localStorage.setItem("USER_JUDGE0_API_KEY", judge0Key.trim());
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 rounded-full shadow-2xl transition-all z-40 group"
      >
        <SettingsIcon className="text-zinc-400 group-hover:text-blue-400 transition-colors" size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-3xl z-50 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Key size={20} />
                  </div>
                  <h2 className="text-xl font-bold">API Keys</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Bring your own API keys to bypass server rate limits. Keys are stored locally in your browser.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Groq API Key</label>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Judge0 RapidAPI Key</label>
                  <input
                    type="password"
                    placeholder="Enter RapidAPI Key"
                    value={judge0Key}
                    onChange={(e) => setJudge0Key(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-zinc-600">
                    Host: judge0-ce.p.rapidapi.com
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Keys
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
