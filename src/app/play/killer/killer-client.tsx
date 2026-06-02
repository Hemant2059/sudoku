"use client";

import { useState, useEffect, useCallback } from "react";
import { PlayGame } from "@/components/play/play-game";
import type { Cage } from "@/lib/types";

interface KillerData {
  puzzle: string;
  solution: string;
  cages: Cage[];
}

export function KillerClient() {
  const [data, setData] = useState<KillerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/killer/generate");
      const json = await res.json();
      if (json.command === "error") throw new Error(json.data.message);
      setData(json.data);
    } catch (e) {
      console.error(e);
      setError("Failed to generate killer puzzle.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPuzzle();
  }, [fetchPuzzle]);

  if (loading && !data) {
    return (
      <div className="min-h-[calc(100dvh-57px)] bg-background flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-muted-foreground flex items-center gap-3 font-semibold text-sm">
          <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating Killer Cage grid…
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
      cages={data.cages}
      hideDifficulty
      onNewGame={fetchPuzzle}
      variant="killer"
    />
  );
}
