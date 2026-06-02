"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GameHeaderProps {
  displayDifficulty?: string;
  loading: boolean;
  graderLevels?: readonly string[];
  onDifficultyChange?: (level: string) => void;
  onNewGame?: () => void;
  elapsed: number;
  paused: boolean;
  onPauseToggle: () => void;
  fmtTime: (s: number) => string;
  onOpenRules: () => void;
  hideDifficulty?: boolean;
}

export function GameHeader({
  displayDifficulty,
  loading,
  graderLevels,
  onDifficultyChange,
  onNewGame,
  elapsed,
  paused,
  onPauseToggle,
  fmtTime,
  onOpenRules,
  hideDifficulty,
}: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono tracking-wider tabular-nums font-medium text-slate-500">
          {fmtTime(elapsed)}
        </span>
        <button onClick={onPauseToggle} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" title={paused ? "Resume" : "Pause"}>
          {paused ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenRules}
          className="h-8 w-8 rounded-full border-2 border-slate-700 dark:border-zinc-300 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center font-bold text-xs"
          title="How to Play"
        >
          ?
        </button>
        {!hideDifficulty && graderLevels && displayDifficulty && onDifficultyChange && (
          <Select value={displayDifficulty} onValueChange={(v) => {
            if (!v || loading) return;
            onDifficultyChange(v);
          }} disabled={loading}>
            <SelectTrigger className="h-9 w-[110px] sm:w-[130px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm rounded-xl text-xs sm:text-sm font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {graderLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <button
          onClick={onNewGame}
          disabled={loading}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70 flex items-center gap-1.5"
        >
          {loading && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {hideDifficulty ? "New Puzzle" : "New Game"}
        </button>
      </div>
    </div>
  );
}
