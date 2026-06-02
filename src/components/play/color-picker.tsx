"use client";

import { cn } from "@/lib/utils";

const CELL_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

interface ColorPickerProps {
  phase: string;
  onApplyColor: (color: string) => void;
  onEraseColor: () => void;
}

export function ColorPicker({
  phase,
  onApplyColor,
  onEraseColor,
}: ColorPickerProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {CELL_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onApplyColor(color)}
          className={cn(
            "w-7 h-7 rounded-full transition-all border-2",
            "border-transparent hover:border-slate-900 dark:hover:border-white hover:scale-110 hover:shadow-md"
          )}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <button
        onClick={onEraseColor}
        disabled={phase !== "playing"}
        className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-zinc-600 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
        title="Remove color from selected cells"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  );
}
