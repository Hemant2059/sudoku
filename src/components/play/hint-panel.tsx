"use client";

import { Badge } from "@/components/ui/badge";
import type { HintStep } from "@/lib/types";

interface HintPanelProps {
  activeHint: HintStep;
  onDismiss: () => void;
  onApply: () => void;
}

function unitLabel(highlights: HintStep["uiHighlights"]): string | null {
  if (!highlights.unitCells || highlights.unitCells.length === 0) return null;
  const first = highlights.unitCells[0];
  const r = Math.floor(first / 9);
  const c = first % 9;
  if (highlights.unitCells.length === 9) {
    const sameRow = highlights.unitCells.every((i) => Math.floor(i / 9) === r);
    const sameCol = highlights.unitCells.every((i) => i % 9 === c);
    if (sameRow) return `Look at Row ${r + 1}`;
    if (sameCol) return `Look at Column ${c + 1}`;
  }
  if (highlights.unitCells.length === 9) return `Look at Box ${Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1}`;
  return null;
}

export function HintPanel({ activeHint, onDismiss, onApply }: HintPanelProps) {
  const unit = unitLabel(activeHint.uiHighlights);
  return (
    <div className="w-full bg-purple-50/50 dark:bg-purple-950/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30 animate-in fade-in slide-in-from-top-4 duration-300 mt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-100">
            {activeHint.strategyName}
          </Badge>
          <span className="text-[10px] text-slate-400 font-mono">Step {activeHint.stepNumber}</span>
          {activeHint.isFallbackUsed && (
            <Badge variant="outline" className="text-[10px]">fallback</Badge>
          )}
        </div>
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {unit && (
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{unit}</p>
      )}

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
        {activeHint.description}
      </p>

      {activeHint.mutations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeHint.mutations.map((m, i) => (
            <div key={i} className="px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-800 text-[10px] font-mono bg-white dark:bg-zinc-900">
              {m.action === "SET_VALUE" ? (
                <><span className="text-emerald-600 dark:text-emerald-400 font-bold">{m.digit}</span> at {m.cell}</>
              ) : (
                <><span className="text-red-500 font-bold">&times;{m.digit}</span> at {m.cell}</>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 h-8 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
