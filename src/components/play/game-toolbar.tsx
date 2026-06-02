"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GameToolbarProps {
  undoDisabled: boolean;
  redoDisabled: boolean;
  phase: string;
  mistakesSize: number;
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
  onPrint: () => void;
  onExport: () => void;
  onSubmit: () => void;
  onSolve?: () => void;
  showExtras?: boolean;
}

export function GameToolbar({
  undoDisabled,
  redoDisabled,
  phase,
  mistakesSize,
  onUndo,
  onRedo,
  onSelectAll,
  onPrint,
  onExport,
  onSubmit,
  onSolve,
  showExtras = true,
}: GameToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
      <div className="flex items-center gap-1">
        <button onClick={onUndo} disabled={undoDisabled} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors" title="Undo"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
        <button onClick={onRedo} disabled={redoDisabled} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors" title="Redo"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg></button>
        {showExtras && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1 bg-slate-200 dark:bg-zinc-800" />
            <button onClick={onSelectAll} disabled={phase !== "playing"} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors" title="Select All (Ctrl+A)"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
            <Separator orientation="vertical" className="h-6 mx-1 bg-slate-200 dark:border-zinc-800" />
            <button onClick={onPrint} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors" title="Print"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
            <button onClick={onExport} disabled={phase !== "playing"} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors" title="Export"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 pr-1">
        {phase === "correct" && <Badge className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold border-0">SOLVED</Badge>}
        {phase === "wrong" && <Badge variant="destructive" className="px-2 py-0.5 rounded-md text-[10px] font-bold">{mistakesSize} ERRORS</Badge>}
        {phase === "playing" && (
          <div className="flex items-center gap-1">
            <button onClick={onSolve} className="h-8 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" title="Solve with step-by-step explanation">Solve</button>
            <button onClick={onSubmit} className="h-8 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors">Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}
