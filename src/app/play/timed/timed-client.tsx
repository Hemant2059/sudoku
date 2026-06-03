"use client";

import { useState, useCallback } from "react";
import { PlayGame } from "@/components/play/play-game";

type Difficulty = "easy" | "medium" | "hard" | "expert";

const DIFF_LABELS: { key: Difficulty; label: string; time: number }[] = [
  { key: "easy", label: "Easy", time: 600 },
  { key: "medium", label: "Medium", time: 900 },
  { key: "hard", label: "Hard", time: 1500 },
  { key: "expert", label: "Expert", time: 2400 },
];

export function TimedClient() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [puzzle, setPuzzle] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [maxTime, setMaxTime] = useState<number>(0);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback((diff: Difficulty) => {
    const entry = DIFF_LABELS.find((d) => d.key === diff)!;
    setSelectedDifficulty(diff);
    setMaxTime(entry.time);
    fetch(`/api/generate?difficulty=${diff}`)
      .then((r) => r.json())
      .then((data) => {
        setPuzzle(data.data.puzzle);
        setSolution(data.data.solution);
        setGameKey((k) => k + 1);
      });
  }, []);

  const handleNewGame = useCallback(() => {
    if (selectedDifficulty) {
      handleStart(selectedDifficulty);
    }
  }, [selectedDifficulty, handleStart]);

  if (!selectedDifficulty || !puzzle || !solution) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xs w-full text-center">
          <h1 className="text-lg font-bold text-foreground mb-1">Timed Mode</h1>
          <p className="text-xs text-muted-foreground mb-4">Pick a difficulty and race the clock.</p>
          <div className="flex flex-col gap-2">
            {DIFF_LABELS.map((d) => (
              <button
                key={d.key}
                onClick={() => handleStart(d.key)}
                className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-sm font-semibold transition-colors"
              >
                {d.label} — {Math.floor(d.time / 60)} min
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col">
      <PlayGame
        key={gameKey}
        initialPuzzle={puzzle}
        initialSolution={solution}
        hideDifficulty
        maxTime={maxTime}
        onNewGame={handleNewGame}
      />
    </div>
  );
}
