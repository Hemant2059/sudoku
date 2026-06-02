"use client";

import { useState } from "react";
import Link from "next/link";
import { STRATEGY_LIST, type StrategyInfo } from "@/lib/strategies";
import { ExampleGrid } from "@/components/example-grid";
import { Compass, GraduationCap, ChevronDown, Search, ArrowRight } from "lucide-react";

const tierColors: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15",
  MEDIUM: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/15",
  HARD: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15",
  EXPERT: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/15",
  MASTER: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/15",
  EXTREME: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/15",
};

// Map strategies to categories
type Category = "all" | "basic" | "intermediate" | "advanced" | "master";

function getStrategyCategory(tier: string): Category {
  switch (tier) {
    case "EASY":
      return "basic";
    case "MEDIUM":
      return "intermediate";
    case "HARD":
    case "EXPERT":
      return "advanced";
    case "MASTER":
    case "EXTREME":
    default:
      return "master";
  }
}

export function LearnClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered = STRATEGY_LIST.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    const cat = getStrategyCategory(s.tier);
    if (activeCategory !== "all" && cat !== activeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-[calc(100dvh-57px)] bg-background py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">SudoZen Academy</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Sudoku Strategy Guide</h1>
            <p className="text-sm text-muted-foreground mt-1.5 font-medium">
              From absolute basic cell rules to complex logical proof chains.
            </p>
          </div>
          <Link
            href="/play"
            className="self-start sm:self-center h-10 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
          >
            Start Playing
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-4 rounded-2xl border border-border shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/60 text-foreground border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all"
            />
          </div>

          {/* Categories Tab Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["all", "basic", "intermediate", "advanced", "master"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/30 hover:bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy list */}
        <div className="space-y-4">
          {filtered.map((strategy) => (
            <StrategyCard key={strategy.name} strategy={strategy} />
          ))}
          {filtered.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <Compass className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No techniques match your search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StrategyCard({ strategy }: { strategy: StrategyInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/20 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
              {strategy.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tierColors[strategy.tier] || "bg-secondary text-muted-foreground border-border"}`}>
                {strategy.tier}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Tactic Difficulty: {strategy.difficulty} / 6
              </span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-6 border-t border-border/40 pt-5 bg-card">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="shrink-0 w-full md:w-[320px] mx-auto lg:mx-0">
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                <ExampleGrid
                  puzzle={strategy.examplePuzzle}
                  highlights={{
                    greenCells: strategy.exampleHighlights.green,
                    redCells: strategy.exampleHighlights.red,
                    eliminationCandidates: strategy.exampleHighlights.eliminations,
                    unitCells: [],
                  }}
                />
              </div>
              {strategy.exampleNote && (
                <p className="mt-3 text-[10px] text-center text-muted-foreground font-semibold leading-relaxed px-1">
                  {strategy.exampleNote}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-4 text-xs text-muted-foreground min-w-0 font-medium leading-relaxed">
              <p className="text-foreground text-sm font-semibold leading-relaxed">{strategy.description}</p>

              <div className="bg-secondary/20 p-4 rounded-xl border border-border/40">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide mb-1.5">Logical Rule</p>
                <p>{strategy.howItWorks}</p>
              </div>

              {strategy.example && (
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/60 text-foreground">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Interactive Example</p>
                  <p className="font-semibold leading-relaxed">{strategy.example}</p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Link
                  href={`/solver?puzzle=${strategy.examplePuzzle}`}
                  className="inline-flex h-9 px-4 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-95 transition-all text-[11px] active:scale-95 shadow-sm"
                >
                  Analyze in Solver
                </Link>
                <Link
                  href="/play"
                  className="inline-flex h-9 px-4 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary font-bold text-foreground transition-all text-[11px] active:scale-95"
                >
                  Practice puzzles
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
