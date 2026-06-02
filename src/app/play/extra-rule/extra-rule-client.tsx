"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const variantList = [
  {
    id: "xsudoku",
    title: "X-Sudoku",
    description: "Both main diagonal lines must also contain digits 1 to 9 exactly once.",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    border: "border-amber-500/20 hover:border-amber-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="2" x2="34" y2="34" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="34" y1="2" x2="2" y2="34" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    id: "hyper",
    title: "Hyper-Sudoku",
    description: "Four extra 3×3 shaded windows that must also contain digits 1 to 9.",
    color: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500/5 hover:bg-sky-500/10",
    border: "border-sky-500/20 hover:border-sky-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="5" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" />
        <rect x="23" y="5" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" />
        <rect x="5" y="23" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" />
        <rect x="23" y="23" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" />
      </svg>
    ),
  },
  {
    id: "antiknight",
    title: "Anti-Knight",
    description: "Cells a knight's move apart cannot contain the same digit constraint.",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/5 hover:bg-violet-500/10",
    border: "border-violet-500/20 hover:border-violet-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <text x="14" y="12" fontSize="4" fill="currentColor">&times;</text>
        <text x="20" y="20" fontSize="4" fill="currentColor">&times;</text>
        <text x="14" y="28" fontSize="4" fill="currentColor">&times;</text>
      </svg>
    ),
  },
  {
    id: "antiking",
    title: "Anti-King",
    description: "Cells a king's move apart (diagonals included) cannot share a digit.",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/5 hover:bg-rose-500/10",
    border: "border-rose-500/20 hover:border-rose-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
        <text x="17" y="20" fontSize="5" fill="currentColor">♚</text>
      </svg>
    ),
  },
  {
    id: "thermo",
    title: "Thermo",
    description: "Digits along a thermometer must strictly increase from bulb to tip.",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/5 hover:bg-red-500/10",
    border: "border-red-500/20 hover:border-red-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="18" cy="28" r="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="18" y1="24" x2="18" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="12" x2="24" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "arrow",
    title: "Arrow",
    description: "Digits on an arrow line must sum to the digit inside its attached circle.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500/5 hover:bg-orange-500/10",
    border: "border-orange-500/20 hover:border-orange-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="12" x2="28" y2="24" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="28,24 24,22 26,26" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "palindrome",
    title: "Palindromic",
    description: "Digits along marked lines read identically both forwards and backwards.",
    color: "text-pink-500 dark:text-pink-400",
    bg: "bg-pink-500/5 hover:bg-pink-500/10",
    border: "border-pink-500/20 hover:border-pink-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="6" y1="18" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="10" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="26" x2="24" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <text x="11" y="20" fontSize="4" fill="currentColor">A</text>
        <text x="17" y="14" fontSize="4" fill="currentColor">B</text>
        <text x="25" y="24" fontSize="4" fill="currentColor">A</text>
      </svg>
    ),
  },
  {
    id: "renban",
    title: "Renban",
    description: "Digits on Renban lines form a consecutive non-repeating sequence.",
    color: "text-teal-500 dark:text-teal-400",
    bg: "bg-teal-500/5 hover:bg-teal-500/10",
    border: "border-teal-500/20 hover:border-teal-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M6 8 Q12 4 18 8 T30 8 T36 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "kropki",
    title: "Kropki Dots",
    description: "White dot = consecutive digits. Black dot = one digit is double the other.",
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-500/5 hover:bg-cyan-500/10",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="13" cy="18" r="2" fill="white" stroke="currentColor" strokeWidth="1" />
        <circle cx="23" cy="18" r="2" fill="currentColor" />
        <line x1="15" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
      </svg>
    ),
  },
  {
    id: "xv",
    title: "XV Constraints",
    description: "V clue = adjacent cells sum to 5. X clue = adjacent cells sum to 10.",
    color: "text-lime-500 dark:text-lime-400",
    bg: "bg-lime-500/5 hover:bg-lime-500/10",
    border: "border-lime-500/20 hover:border-lime-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <text x="6" y="22" fontSize="12" fontWeight="bold" fill="currentColor">V</text>
        <text x="21" y="22" fontSize="12" fontWeight="bold" fill="currentColor">X</text>
      </svg>
    ),
  },
  {
    id: "greaterthan",
    title: "Greater Than",
    description: "Inequality signs between adjacent cells define relative digit sizes.",
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/5 hover:bg-indigo-500/10",
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        <text x="16" y="17" fontSize="8" fill="currentColor">&lt;</text>
        <text x="16" y="29" fontSize="8" fill="currentColor">&gt;</text>
      </svg>
    ),
  },
];

export function ExtraRuleClient() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100dvh-57px)] bg-background flex justify-center p-4 sm:p-8 transition-colors duration-200 overflow-x-hidden">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.push("/play")}
            className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modes
          </button>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Extra Rule Variants
          </h1>
          <p className="text-muted-foreground text-sm font-semibold max-w-md mx-auto">
            Explore advanced Sudoku variations. Each variant introduces unique geometric or mathematical constraints.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {variantList.map((v) => (
            <button
              key={v.id}
              onClick={() => router.push(`/play/extra-rule/${v.id}`)}
              className={`group flex flex-col items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left bg-card cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${v.bg} ${v.border}`}
            >
              <div className={`p-2 rounded-xl bg-card border border-border/50 ${v.color}`}>
                {v.icon}
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {v.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
                  {v.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
