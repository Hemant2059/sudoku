"use client";

import { cn } from "@/lib/utils";

interface TimerCardProps {
  elapsed: number;
  paused: boolean;
  onPauseToggle: () => void;
  fmtTime: (s: number) => string;
}

export function TimerCard({ elapsed, paused, onPauseToggle, fmtTime }: TimerCardProps) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-mono tracking-wider tabular-nums font-medium">
          {fmtTime(elapsed)}
        </span>
      </div>
      <button onClick={onPauseToggle} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" title={paused ? "Resume" : "Pause"}>
        {paused ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
      </button>
    </div>
  );
}
