"use client";

import { cn } from "@/lib/utils";
import type { InputMode } from "@/lib/types";

interface ActionRowProps {
  phase: string;
  loading: boolean;
  inputMode: InputMode;
  onPencilToggle: () => void;
  onCenterToggle: () => void;
  onErase: () => void;
  onClear: () => void;
  onHint: () => void;
  onAutoFill: () => void;
  hintDisabled?: boolean;
}

const btnBase = "flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-200 shadow-sm border disabled:opacity-40 cursor-pointer font-sans";
const btnDefault = "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary";
const btnActive = "bg-primary text-primary-foreground border-primary shadow-sm shadow-indigo-600/10 hover:opacity-95";

const PencilIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);

const CenterIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
);

export function ActionRow({
  phase,
  loading,
  inputMode,
  onPencilToggle,
  onCenterToggle,
  onErase,
  onClear,
  onHint,
  onAutoFill,
  hintDisabled,
}: ActionRowProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <button onClick={onPencilToggle} className={cn(btnBase, inputMode === "PENCIL" ? btnActive : btnDefault)}>
        <PencilIcon />
        <span className="text-[10px] font-medium">Notes</span>
      </button>
      <button onClick={onCenterToggle} className={cn(btnBase, inputMode === "CENTER" ? btnActive : btnDefault)}>
        <CenterIcon />
        <span className="text-[10px] font-medium">Center</span>
      </button>
      <button onClick={onErase} disabled={phase !== "playing"} className={cn(btnBase, btnDefault)}>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        <span className="text-[10px] font-medium">Erase</span>
      </button>
      <button onClick={onClear} disabled={phase !== "playing"} className={cn(btnBase, "bg-card border-border text-amber-600 dark:text-amber-400 hover:bg-amber-500/10")}>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        <span className="text-[10px] font-medium">Clear</span>
      </button>
      <button onClick={onHint} disabled={phase !== "playing" || loading || hintDisabled} className={cn(btnBase, "bg-card border-border text-primary hover:bg-primary/10")}>
        {loading ? <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mb-1" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
        <span className="text-[10px] font-medium">Hint</span>
      </button>
      <button onClick={onAutoFill} disabled={phase !== "playing"} className={cn(btnBase, btnDefault)}>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <span className="text-[10px] font-medium">Auto-fill</span>
      </button>
    </div>
  );
}
