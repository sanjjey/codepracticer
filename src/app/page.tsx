import React from "react";
import Link from "next/link";
import { Brain, Combine, Tags, Code2, Sparkles, Clock, ShieldCheck } from "lucide-react";

const features = [
  {
    id: "user-questions",
    title: "User_questions",
    description: "Input any problem description and let AI frame it, generate edge cases, and challenge you.",
    icon: Brain,
    href: "/features/user-questions",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "combined-questions",
    title: "Combined_questions",
    description: "Mix concepts from multiple problems into a single, cohesive logical challenge.",
    icon: Combine,
    href: "/features/combined-questions",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "tag-based-questions",
    title: "Tag_based_questions",
    description: "Select concepts and conquer AI-generated cycles with increasing difficulty.",
    icon: Tags,
    href: "/features/tag-based",
    gradient: "from-orange-500 to-rose-500",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 px-6 flex flex-col items-center text-center space-y-8 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-pulse">
          <Sparkles size={14} />
          <span>Powered by Groq Llama 3</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
          Master DSA with <span className="text-gradient">Intelligence.</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
          Not just another LeetCode clone. A dynamic, AI-first platform that reframes, 
          combines, and challenges your logical depth in real-time.
        </p>

        <div className="flex gap-4 pt-4">
          <Link 
            href="#features" 
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-all glow-button"
          >
            Get Started
          </Link>
          <Link 
            href="/problems" 
            className="px-8 py-4 rounded-xl glass-panel font-semibold transition-all hover:bg-zinc-800"
          >
            View Problems
          </Link>
        </div>
      </section>

      {/* Stats/Benefits */}
      <section className="w-full py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Lockout Mode</h3>
            <p className="text-zinc-500 text-sm">Solutions are hidden based on difficulty to force logical growth.</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Edge-Case Mastery</h3>
            <p className="text-zinc-500 text-sm">AI prioritizes the most difficult edge cases for every problem.</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Code2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Groq Latency</h3>
            <p className="text-zinc-500 text-sm">Real-time question generation in milliseconds, not minutes.</p>
          </div>
        </div>
      </section>

      {/* Feature Selection */}
      <section id="features" className="w-full py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your path</h2>
          <p className="text-zinc-500">Pick a feature to start your journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link 
              key={feature.id} 
              href={feature.href}
              className="group relative glass-panel p-8 rounded-3xl hover:border-zinc-700 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={28} />
              </div>

              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className="flex items-center text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                Start Challenge 
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-10 border-t border-zinc-900 mt-20 text-center text-zinc-600 text-sm">
        &copy; 2026 LeetAI Platform. Built with Groq & Next.js
      </footer>
    </div>
  );
}
