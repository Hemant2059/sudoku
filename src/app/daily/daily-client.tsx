"use client";

import { useEffect, useState, useCallback } from "react";
import { PlayGame } from "@/components/play/play-game";

const DAILY_KEY = "sudozen-daily-scores";

interface DailyScore {
  date: string;
  time: number;
  numMoves: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadScores(): DailyScore[] {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveScore(time: number, numMoves: number): void {
  const today = getToday();
  const scores = loadScores();
  const existing = scores.findIndex((s) => s.date === today);
  const entry: DailyScore = { date: today, time, numMoves };
  if (existing >= 0) {
    if (time < scores[existing].time) {
      scores[existing] = entry;
    }
  } else {
    scores.push(entry);
  }
  localStorage.setItem(DAILY_KEY, JSON.stringify(scores));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DailyClient() {
  const [puzzle, setPuzzle] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayScore, setTodayScore] = useState<DailyScore | null>(null);
  const [pastScores, setPastScores] = useState<DailyScore[]>([]);

  useEffect(() => {
    const today = getToday();
    const scores = loadScores();
    const ts = scores.find((s) => s.date === today);
    if (ts) setTodayScore(ts);
    setPastScores(scores.filter((s) => s.date !== today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7));
  }, []);

  useEffect(() => {
    fetch("/api/daily/puzzle")
      .then((r) => r.json())
      .then((data) => {
        const d = data.data;
        setPuzzle(d.puzzle);
        setSolution(d.solution);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNewGame = useCallback(() => {
    setLoading(true);
    fetch("/api/daily/puzzle")
      .then((r) => r.json())
      .then((data) => {
        const d = data.data;
        setPuzzle(d.puzzle);
        setSolution(d.solution);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-pulse text-sm text-muted-foreground">Loading today&apos;s puzzle...</div>
      </div>
    );
  }

  if (!puzzle || !solution) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Could not load today&apos;s puzzle.</p>
          <button onClick={handleNewGame} className="h-9 px-4 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-3 pb-1 text-center">
        <h1 className="text-sm font-bold text-foreground">
          Daily Puzzle — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </h1>
        {todayScore && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Best: {formatTime(todayScore.time)} ({todayScore.numMoves} moves)
          </p>
        )}
      </div>
      <PlayGame
        key={getToday()}
        initialPuzzle={puzzle}
        initialSolution={solution}
        hideDifficulty
        onNewGame={handleNewGame}
      />
      {pastScores.length > 0 && (
        <div className="shrink-0 px-3 py-2 border-t border-border">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 text-center">Recent Days</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {pastScores.map((s) => (
              <div key={s.date} className="text-[10px] text-muted-foreground">
                <span className="font-medium">{new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                {" "}{formatTime(s.time)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
