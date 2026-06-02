"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Play, Plus, Compass } from "lucide-react";

const modes = [
  {
    id: "classic",
    title: "Classic Sudoku",
    description: "Standard 9×9 grid. Fill cells so every row, column, and 3×3 box contains digits 1 to 9 exactly once.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <line x1="14" y1="2" x2="14" y2="34" stroke="currentColor" strokeWidth="1.5" />
        <line x1="22" y1="2" x2="22" y2="34" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="22" x2="34" y2="22" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/5 hover:bg-blue-500/10",
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    id: "killer",
    title: "Killer Sudoku",
    description: "Classic rules plus cage groupings with math sum clues. Digits cannot repeat within a cage constraint.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="14" y1="2" x2="14" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="22" y1="2" x2="22" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="2" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="2" y1="22" x2="34" y2="22" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    ),
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-500/5 hover:bg-purple-500/10",
    border: "border-purple-500/20 hover:border-purple-500/40",
  },
  {
    id: "extra-rule",
    title: "Variant Extra Rule",
    description: "Classic rules plus specialized grid layouts: X-Sudoku diagonals, Anti-Knight movements, Thermo, or Arrow constraints.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
        <line x1="2" y1="2" x2="34" y2="34" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="2" y1="34" x2="34" y2="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    ),
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    id: "custom",
    title: "Custom Sandbox",
    description: "Enter your own board strings, cage definitions, or constraints manually to practice or analyze.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
        <rect x="4" y="4" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 18h16M18 10v16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
  },
];

export function PlayClient() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100dvh-57px)] flex items-center justify-center p-4 sm:p-8 bg-background transition-colors duration-200">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Choose a Game Mode
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Select a logic variant or design a custom sandbox to start your focus training.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => router.push(`/play/${mode.id}`)}
              className={`group flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all duration-300 text-left bg-card cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${mode.bg} ${mode.border}`}
            >
              <div className={`p-2.5 rounded-xl bg-card border border-border/60 ${mode.color}`}>
                {mode.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  {mode.title}
                  <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">→</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">
                  {mode.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
