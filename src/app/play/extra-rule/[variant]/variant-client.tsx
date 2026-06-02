"use client";

import { useState, useEffect, useCallback } from "react";
import { PlayGame } from "@/components/play/play-game";
import type { VariantConstraints } from "@/lib/types";

const variantMeta: Record<string, { name: string; description: string; status: "playable" | "coming-soon" }> = {
  xsudoku: { name: "X-Sudoku", description: "Both main diagonals must also contain digits 1–9 exactly once.", status: "playable" },
  hyper: { name: "Hyper-Sudoku", description: "Four extra 3×3 windows must also contain digits 1–9 exactly once.", status: "playable" },
  antiknight: { name: "Anti-Knight", description: "Cells a knight's move apart cannot contain the same digit.", status: "playable" },
  antiking: { name: "Anti-King", description: "Cells a king's move apart (including diagonals) cannot share a digit.", status: "playable" },
  thermo: { name: "Thermo", description: "Digits along a thermometer must strictly increase from bulb to tip.", status: "playable" },
  arrow: { name: "Arrow", description: "Digits on an arrow line sum to the digit in the attached circle.", status: "playable" },
  palindrome: { name: "Palindromic", description: "Digits on marked lines read the same forwards and backwards.", status: "playable" },
  renban: { name: "Renban", description: "Digits on a Renban line form a consecutive set (no repeats).", status: "playable" },
  kropki: { name: "Kropki", description: "White dot = consecutive digits. Black dot = one digit is double the other.", status: "playable" },
  xv: { name: "XV", description: "V = adjacent digits sum to 5. X = adjacent digits sum to 10.", status: "playable" },
  greaterthan: { name: "Greater Than", description: "Inequality signs between adjacent cells indicate their relative order.", status: "playable" },
};

const PLACEHOLDER_PUZZLE = ".....6....59.....82....8....45........3........6..3.54...325..6..................";

interface VariantClientProps {
  variant: string;
}

export function VariantClient({ variant }: VariantClientProps) {
  const meta = variantMeta[variant];

  const [data, setData] = useState<{ puzzle: string; solution: string; constraints?: VariantConstraints } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/variant/generate?variant=${variant}&difficulty=easy`);
      const json = await res.json();
      if (json.command === "error") throw new Error(json.data.message);
      setData({ puzzle: json.data.puzzle, solution: json.data.solution, constraints: json.data.constraints ?? undefined });
    } catch (e) {
      console.error(e);
      setError("Failed to generate puzzle.");
    }
    setLoading(false);
  }, [variant]);

  useEffect(() => {
    if (meta?.status === "playable") fetchPuzzle();
    else setLoading(false);
  }, [fetchPuzzle, meta?.status]);

  if (!meta) {
    return (
      <div className="min-h-[calc(100dvh-57px)] bg-background flex items-center justify-center p-4 transition-colors duration-200">
        <p className="text-destructive font-semibold">Unknown variant constraint: {variant}</p>
      </div>
    );
  }

  if (meta.status === "coming-soon") {
    return (
      <div className="min-h-[calc(100dvh-57px)] bg-background flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center max-w-md bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {meta.name}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {meta.description}
          </p>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-foreground/80 mb-6">
            <strong className="text-amber-600 dark:text-amber-400">Coming Soon!</strong>
            <br />
            Puzzle generation for this variant is being developed.
            You can already play a classic puzzle below, or try another variant.
          </div>
          <PlayGame
            key="placeholder"
            initialPuzzle={PLACEHOLDER_PUZZLE}
            variant={variant}
          />
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-[calc(100dvh-57px)] bg-background flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-muted-foreground flex items-center gap-3 font-semibold text-sm">
          <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating {meta.name} board…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100dvh-57px)] bg-background flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center max-w-md bg-card p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-destructive mb-4 font-semibold text-sm">{error}</p>
          <button
            onClick={fetchPuzzle}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-95 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <PlayGame
      key={data.puzzle}
      initialPuzzle={data.puzzle}
      initialSolution={data.solution}
      variant={variant}
      constraints={data.constraints}
      hideDifficulty
      onNewGame={fetchPuzzle}
    />
  );
}
