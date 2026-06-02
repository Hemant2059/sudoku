"use client";

import { useState, useCallback, useRef } from "react";
import { SudokuGrid } from "@/components/sudoku-grid";
import { PlayGame } from "@/components/play/play-game";
import type {
  CellState,
  CellValue,
  Cage,
  VariantConstraints,
} from "@/lib/types";
import {
  EMPTY_CELL,
  cellsToPuzzleString,
  puzzleStringToCells,
} from "@/lib/sudoku";
import { cn } from "@/lib/utils";
import { Sparkles, Trash2, Layout, RotateCcw } from "lucide-react";

type CustomType = "classic" | "killer" | "extra-rule";

const VARIANT_OPTIONS = [
  { value: "xsudoku", label: "X-Sudoku" },
  { value: "hyper", label: "Hyper-Sudoku" },
  { value: "antiknight", label: "Anti-Knight" },
  { value: "antiking", label: "Anti-King" },
  { value: "thermo", label: "Thermo" },
  { value: "arrow", label: "Arrow" },
  { value: "palindrome", label: "Palindromic" },
  { value: "renban", label: "Renban" },
  { value: "kropki", label: "Kropki" },
  { value: "xv", label: "XV" },
  { value: "greaterthan", label: "Greater Than" },
];

export function CustomClient() {
  const [customType, setCustomType] = useState<CustomType>("classic");
  const [inputCells, setInputCells] = useState<CellState[]>(() =>
    Array.from({ length: 81 }, () => EMPTY_CELL())
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [puzzleText, setPuzzleText] = useState("");
  const [cageInput, setCageInput] = useState("");
  const [variant, setVariant] = useState("xsudoku");
  const [constraintsInput, setConstraintsInput] = useState("");

  const [puzzle, setPuzzle] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [cages, setCages] = useState<Cage[] | undefined>(undefined);
  const [constraints, setConstraints] = useState<VariantConstraints | undefined>(undefined);
  const [playVariant, setPlayVariant] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;

  const filledCount = inputCells.filter((c) => c.value !== null).length;

  const handleCellClick = useCallback((index: number, _e: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
    setSelectedIndex(index);
    selectedRef.current = index;
  }, []);

  const applyNumber = useCallback((n: number) => {
    const cur = selectedRef.current;
    if (cur === null) return;
    setInputCells((prev) => {
      const next = prev.map((c) => ({ ...c, candidates: new Set(c.candidates) }));
      next[cur].value = n as CellValue;
      next[cur].candidates = new Set();
      setPuzzleText(cellsToPuzzleString(next));
      return next;
    });
  }, []);

  const handleErase = useCallback(() => {
    const cur = selectedRef.current;
    if (cur === null) return;
    setInputCells((prev) => {
      const next = prev.map((c) => ({ ...c }));
      next[cur].value = null;
      next[cur].candidates = new Set();
      setPuzzleText(cellsToPuzzleString(next));
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setInputCells(Array.from({ length: 81 }, () => EMPTY_CELL()));
    setPuzzleText("");
    setSelectedIndex(null);
  }, []);

  const handleGridKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const cur = selectedRef.current;

    if (e.key === "Escape") { setSelectedIndex(null); return; }

    if (cur === null) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setSelectedIndex(40);
        selectedRef.current = 40;
      }
      return;
    }

    const row = Math.floor(cur / 9);
    const col = cur % 9;

    const moveTo = (next: number) => { setSelectedIndex(next); selectedRef.current = next; };

    if (e.key === "ArrowLeft") { e.preventDefault(); moveTo(col === 0 ? row * 9 + 8 : cur - 1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); moveTo(col === 8 ? row * 9 : cur + 1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); moveTo(row === 0 ? 72 + col : cur - 9); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); moveTo(row === 8 ? col : cur + 9); return; }

    let num = parseInt(e.key);
    if (isNaN(num) || num < 1 || num > 9) {
      const m = e.code.match(/^Digit(\d)$/);
      if (m) num = parseInt(m[1]);
    }
    if (num >= 1 && num <= 9) { e.preventDefault(); applyNumber(num); return; }

    if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { e.preventDefault(); handleErase(); }
  }, [applyNumber, handleErase]);

  const handlePlay = useCallback(async () => {
    if (filledCount < 1) { setError("Enter at least one clue."); return; }
    setError(null);
    setLoading(true);

    const puzzleStr = cellsToPuzzleString(inputCells);

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzle: puzzleStr }),
      });
      const data = await res.json();
      if (data.command !== "error") {
        setSolution(data.data.solvedGrid as string);
      }
    } catch {
      console.warn("Could not solve puzzle; hints will be unavailable.");
    }

    let parsedCages: Cage[] | undefined;
    if (customType === "killer" && cageInput.trim()) {
      try {
        parsedCages = JSON.parse(cageInput.trim()) as Cage[];
        if (!Array.isArray(parsedCages)) throw new Error();
      } catch {
        setError("Invalid cages JSON.");
        setLoading(false);
        return;
      }
    }

    let parsedConstraints: VariantConstraints | undefined;
    if (customType === "extra-rule" && constraintsInput.trim()) {
      try {
        parsedConstraints = JSON.parse(constraintsInput.trim()) as VariantConstraints;
      } catch {
        setError("Invalid constraints JSON.");
        setLoading(false);
        return;
      }
    }

    setPuzzle(puzzleStr);
    setCages(parsedCages);
    setConstraints(parsedConstraints);
    setPlayVariant(customType === "extra-rule" ? variant : customType === "killer" ? "killer" : undefined);
    setLoading(false);
  }, [inputCells, cageInput, constraintsInput, variant, customType, filledCount]);

  const handleNewGame = useCallback(() => {
    setPuzzle(null);
    setSolution(null);
    setCages(undefined);
    setConstraints(undefined);
    setPlayVariant(undefined);
  }, []);

  if (puzzle) {
    return (
      <PlayGame
        key={puzzle + (cages ? JSON.stringify(cages) : "") + (playVariant || "")}
        initialPuzzle={puzzle}
        initialSolution={solution ?? undefined}
        cages={cages}
        constraints={constraints}
        variant={playVariant}
        hideDifficulty
        onNewGame={handleNewGame}
      />
    );
  }

  return (
    <div className="min-h-[calc(100dvh-57px)] bg-background flex flex-col lg:flex-row items-center justify-center py-6 px-4 gap-6 lg:gap-8 max-w-6xl mx-auto w-full transition-colors duration-200 overflow-x-hidden">
      <div className="w-full max-w-[500px] lg:max-w-[600px] lg:flex-1 relative flex flex-col items-center">
        {/* Custom Tab Selector */}
        <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1 w-full max-w-[450px]">
          {([
            { value: "classic" as CustomType, label: "Classic" },
            { value: "killer" as CustomType, label: "Killer" },
            { value: "extra-rule" as CustomType, label: "Extra Rule" },
          ]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setCustomType(tab.value); setError(null); }}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
                customType === tab.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <SudokuGrid
          cells={inputCells}
          selectedIndex={selectedIndex}
          onCellClick={handleCellClick}
          onKeyDown={handleGridKeyDown}
          inputMode="VALUE"
        />
      </div>

      <div className="w-full max-w-[500px] lg:w-[360px] lg:shrink-0 flex flex-col gap-4">
        {/* Puzzle string input */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">
            Paste Puzzle String
          </label>
          <textarea
            value={puzzleText}
            onChange={(e) => {
              const val = e.target.value;
              setPuzzleText(val);
              const clean = val.replace(/\s/g, "");
              if (clean.length === 81 && /^[0-9.]+$/.test(clean)) {
                setInputCells(puzzleStringToCells(clean));
              }
            }}
            placeholder={"4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......"}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-bold"
          />
          <p className="text-[10px] text-muted-foreground font-semibold mt-1">
            81 characters · maps automatically to grid above
          </p>
        </div>

        {/* Number pad */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="block text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wide">
            Input Controls
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => applyNumber(n)}
                className="aspect-square rounded-xl bg-secondary/30 hover:bg-secondary border border-border text-foreground font-extrabold text-sm transition-all active:scale-95 cursor-pointer font-mono"
              >
                {n}
              </button>
            ))}
            <button
              onClick={handleErase}
              className="aspect-square rounded-xl bg-secondary/30 hover:bg-secondary border border-border text-rose-500 font-extrabold text-sm transition-all active:scale-95 cursor-pointer"
            >
              ⌫
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="flex-1 h-10 px-4 rounded-xl border border-border hover:bg-secondary text-xs font-bold text-foreground transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Board
          </button>
          <span className="text-xs text-muted-foreground font-mono font-bold px-3">
            {filledCount} / 81 clues
          </span>
        </div>

        {/* Mode-specific inputs */}
        {customType === "killer" && (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-fade-in">
            <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">
              Killer Cages (JSON format)
            </label>
            <textarea
              value={cageInput}
              onChange={(e) => setCageInput(e.target.value)}
              placeholder={`[{"cells":[0,1,2],"sum":15}]`}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-bold"
            />
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              JSON array of <code className="text-[10px] bg-secondary px-1 py-0.5 rounded font-mono">{`{cells: number[], sum: number}`}</code>
            </p>
          </div>
        )}

        {customType === "extra-rule" && (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                Variant Constraint
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
              >
                {VARIANT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                Constraints Markings <span className="font-normal normal-case text-muted-foreground/80">(JSON, optional)</span>
              </label>
              <textarea
                value={constraintsInput}
                onChange={(e) => setConstraintsInput(e.target.value)}
                placeholder={`{"thermos":[[1,2,3]]}`}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-bold"
              />
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                Markings JSON for thermo thermometers or arrow vectors.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-rose-500 text-xs font-semibold text-center">{error}</p>
        )}

        <button
          onClick={handlePlay}
          disabled={loading || filledCount < 1}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Initializing Sandbox..." : "Start Custom Sandbox"}
        </button>
      </div>
    </div>
  );
}
