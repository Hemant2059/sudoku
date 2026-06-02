"use client";

interface ConflictModeSelectorProps {
  value: "peer" | "answer" | "none";
  onChange: (mode: "peer" | "answer" | "none") => void;
}

export function ConflictModeSelector({ value, onChange }: ConflictModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-4 text-xs">
      {(["peer", "answer", "none"] as const).map((mode) => (
        <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="conflictMode"
            value={mode}
            checked={value === mode}
            onChange={() => onChange(mode)}
            className="accent-purple-600"
          />
          <span className="text-slate-600 dark:text-slate-400">
            {mode === "peer" ? "Conflicts" : mode === "answer" ? "Wrong" : "Off"}
          </span>
        </label>
      ))}
    </div>
  );
}
