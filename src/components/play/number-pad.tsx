"use client";

import { cn } from "@/lib/utils";

interface NumberPadProps {
  phase: string;
  numberStamp: number | null;
  onNumberClick: (n: number) => void;
}

export function NumberPad({ phase, numberStamp, onNumberClick }: NumberPadProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 w-full mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          onClick={() => onNumberClick(n)}
          disabled={phase !== "playing"}
          className={cn(
            "h-11 w-full text-base font-mono font-extrabold rounded-xl transition-all border flex items-center justify-center cursor-pointer",
            numberStamp === n
              ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-2 ring-primary/20"
              : "bg-card border-border hover:bg-secondary text-foreground hover:border-border/80",
            phase !== "playing" && "opacity-40 pointer-events-none"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
