"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SudokuGrid } from "@/components/sudoku-grid";
import { useToast } from "@/components/toast";
import type { CellState, SolveStep, HintHighlights, VariantConstraints } from "@/lib/types";
import {
  EMPTY_CELL,
  puzzleStringToCells,
  cellsToPuzzleString,
  applyStepsToGrid,
  generateFillSteps,
} from "@/lib/sudoku";
import { getStrategyInfo } from "@/lib/strategies";
import { computeHintHighlights } from "@/lib/sudoku";

const strategyColors: Record<string, string> = {
  "NAKED_SINGLE": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "HIDDEN_SINGLE": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "NAKED_SUBSET": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "POINTING_PAIR": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "X-WING": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "SWORDFISH": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "JELLYFISH": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "ALTERNATING_INFERENCE_CHAIN": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "FORCING_CHAIN": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "DLX_CONTRADICTION_CHAIN": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "DLX_DIRECT_ASSIGNMENT": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function strategyBadgeColor(name: string): string {
  const upper = name.toUpperCase().replace(/ /g, "_");
  return strategyColors[upper] || "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300";
}

function SolverInner() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [inputCells, setInputCells] = useState<CellState[]>(() =>
    Array.from({ length: 81 }, () => EMPTY_CELL())
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"input" | "done">("input");
  const [steps, setSteps] = useState<SolveStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepCells, setStepCells] = useState<CellState[]>([]);
  const [hintHighlights, setHintHighlights] = useState<HintHighlights | null>(null);
  const [initialPuzzle, setInitialPuzzle] = useState<string>("");
  const [solutionStr, setSolutionStr] = useState<string>("");
  const [variant, setVariant] = useState<string>("classic");
  const [constraints, setConstraints] = useState<VariantConstraints | undefined>(undefined);

  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;
  const inputRef = useRef(inputCells);
  inputRef.current = inputCells;
  const variantRef = useRef(variant);
  variantRef.current = variant;
  const constraintsRef = useRef(constraints);
  constraintsRef.current = constraints;

  const filledCount = inputCells.filter((c) => c.value !== null).length;

  const handleCellClick = useCallback((index: number, { ctrlKey, metaKey }: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
    if (phase !== "input") return;
    const multi = ctrlKey || metaKey;
    if (multi) {
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      setSelectedIndices(new Set([index]));
    }
    setSelectedIndex(index);
    selectedRef.current = index;
  }, [phase]);

  const handleNumber = useCallback((n: number) => {
    if (phase !== "input") return;
    const curSelected = selectedRef.current;
    if (curSelected === null) return;
    setInputCells((prev) => {
      const next = prev.map((c) => ({ ...c, candidates: new Set(c.candidates) }));
      next[curSelected].value = n;
      next[curSelected].candidates = new Set();
      return next;
    });
  }, [phase]);

  const handleErase = useCallback(() => {
    if (phase !== "input") return;
    const indices = selectedIndices;
    if (indices.size === 0) return;
    setInputCells((prev) => {
      const next = prev.map((c) => ({ ...c }));
      for (const idx of indices) {
        next[idx].value = null;
        next[idx].candidates = new Set();
      }
      return next;
    });
  }, [phase, selectedIndices]);

  const handleClearAll = useCallback(() => {
    setInputCells(Array.from({ length: 81 }, () => EMPTY_CELL()));
    setSelectedIndex(null);
    setSelectedIndices(new Set());
  }, []);

  const updateForStep = useCallback((cells: CellState[], stepIdx: number, allSteps: SolveStep[]) => {
    const step = allSteps[stepIdx];
    let highlights: HintHighlights;
    if (step.uiHighlights) {
      highlights = step.uiHighlights;
    } else {
      highlights = computeHintHighlights(step.mutations, step.proofChain, step.description, cells);
    }
    setStepCells(cells);
    setHintHighlights(highlights);
    setCurrentStep(stepIdx);
  }, []);

  const doSolve = useCallback(async (puzzleStr: string) => {
    setLoading(true);
    try {
      const variantStr = variantRef.current === "classic" ? undefined : variantRef.current;
      const endpoint = variantStr ? "/api/variant/solve" : "/api/solve";
      const body: any = { puzzle: puzzleStr };
      if (variantStr) body.variant = variantStr;
      if (constraintsRef.current) body.constraints = JSON.stringify(constraintsRef.current);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.command === "error") throw new Error(data.data.message);
      const result = data.data;
      let s: SolveStep[] = result.steps || [];
      setSolutionStr(result.solvedGrid || "");

      if (result.solvedGrid && result.solvedGrid.length === 81) {
        s = generateFillSteps(puzzleStr, result.solvedGrid, s);
      }
      setSteps(s);
      setInitialPuzzle(puzzleStr);

      const initialCells = puzzleStringToCells(puzzleStr);
      if (s.length > 0) {
        const solved = applyStepsToGrid(initialCells, s, 0);
        updateForStep(solved, 0, s);
      } else {
        setStepCells(initialCells);
        setHintHighlights(null);
      }
      setPhase("done");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to solve puzzle.";
      toast(msg);
    }
    setLoading(false);
  }, [updateForStep, constraintsRef]);

  const handleSolve = useCallback(async () => {
    const puzzle = cellsToPuzzleString(inputRef.current);
    const filled = inputRef.current.filter((c) => c.value !== null).length;
    if (filled < 17) {
      toast("Enter at least 17 clues for a valid puzzle.");
      return;
    }
    doSolve(puzzle);
  }, [doSolve]);

  const handleStepChange = useCallback((newStep: number) => {
    if (newStep < 0 || newStep >= steps.length) return;
    const initialCells = puzzleStringToCells(initialPuzzle);
    const count = newStep === steps.length - 1 ? steps.length : newStep;
    const solved = applyStepsToGrid(initialCells, steps, count);
    updateForStep(solved, newStep, steps);
  }, [steps, initialPuzzle, updateForStep]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (phase === "done") {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (currentStep > 0) handleStepChange(currentStep - 1);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        if (currentStep < steps.length - 1) handleStepChange(currentStep + 1);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        handleStepChange(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        handleStepChange(steps.length - 1);
        return;
      }
    }
    if (phase !== "input") return;
    const curSelected = selectedRef.current;
    if (curSelected === null) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) { e.preventDefault(); handleNumber(num); return; }
    if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); handleErase(); }
  }, [phase, currentStep, steps.length, handleStepChange, handleNumber, handleErase]);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('[contenteditable]')) return;
      const event = new KeyboardEvent(e.type, e);
      Object.defineProperty(event, "key", { value: e.key });
      handleKeyDown(event as unknown as React.KeyboardEvent);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyDown]);

  useEffect(() => {
    const puzzleParam = searchParams.get("puzzle");
    if (!puzzleParam) return;
    const variantParam = searchParams.get("variant");
    if (variantParam) {
      setVariant(variantParam);
      variantRef.current = variantParam;
    }
    const constraintsParam = searchParams.get("constraints");
    if (constraintsParam) {
      try {
        const parsed = JSON.parse(constraintsParam);
        setConstraints(parsed);
        constraintsRef.current = parsed;
      } catch { /* ignore invalid constraints JSON */ }
    }
    const puzzleCells = puzzleStringToCells(puzzleParam);
    inputRef.current = puzzleCells;
    setTimeout(() => {
      setInputCells(puzzleCells);
      doSolve(puzzleParam);
    }, 0);
  }, [searchParams, doSolve]);

  const step = steps[currentStep];
  const totalSteps = steps.length;

  return (
    <div
      ref={gridRef}
      tabIndex={-1}
      className="min-h-[calc(100dvh-57px)] bg-background flex flex-col lg:flex-row items-center justify-center py-6 px-4 gap-6 lg:gap-8 max-w-6xl mx-auto w-full focus:outline-none transition-colors duration-200 overflow-x-hidden"
    >
      <div className="w-full max-w-[500px] lg:max-w-[600px] lg:flex-1 relative flex flex-col items-center justify-center">
        {phase === "input" && (
          <SudokuGrid
            cells={inputCells}
            selectedIndex={selectedIndex}
            multiSelectedIndices={selectedIndices.size > 1 ? selectedIndices : undefined}
            onCellClick={handleCellClick}
            inputMode="VALUE"
            variant={variant}
            constraints={constraints}
          />
        )}
        {phase === "done" && stepCells.length > 0 && (
          <SudokuGrid
            cells={stepCells}
            selectedIndex={null}
            onCellClick={() => {}}
            hintHighlights={hintHighlights}
            variant={variant}
            constraints={constraints}
          />
        )}
      </div>

      <div className="w-full max-w-[500px] lg:w-[360px] lg:shrink-0 flex flex-col gap-4">
        {phase === "input" && (
          <>
            <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">Solver Studio</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground">{filledCount} clues</span>
              </div>
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Grid Variant</label>
                    <select
                      value={variant}
                      onChange={(e) => { setVariant(e.target.value); variantRef.current = e.target.value; }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-semibold"
                    >
                      <option value="classic">Classic</option>
                      <option value="xsudoku">X-Sudoku</option>
                      <option value="hyper">Hyper-Sudoku</option>
                      <option value="antiknight">Anti-Knight</option>
                      <option value="antiking">Anti-King</option>
                      <option value="thermo">Thermo</option>
                      <option value="arrow">Arrow</option>
                      <option value="palindrome">Palindromic</option>
                      <option value="renban">Renban</option>
                      <option value="kropki">Kropki</option>
                      <option value="xv">XV</option>
                      <option value="greaterthan">Greater Than</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2 lg:pt-0">
                    <button
                      onClick={handleErase}
                      disabled={selectedIndex === null}
                      className="flex-1 h-11 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                    >
                      Erase
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex-1 h-11 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSolve}
                      disabled={loading || filledCount < 17}
                      className="flex-1 h-11 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                    >
                      {loading ? "Analyzing..." : "Solve"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-9 gap-1.5 sm:gap-2 justify-center pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleNumber(n)}
                      disabled={phase !== "input"}
                      className="h-11 px-0 rounded-xl bg-card border border-border text-foreground text-sm sm:text-base font-extrabold hover:bg-secondary disabled:opacity-40 transition-all active:scale-95 shadow-sm font-mono cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:block border-t border-border pt-4 text-xs text-muted-foreground space-y-2.5 font-medium leading-relaxed">
                  <p>1. Select a cell on the grid and enter numbers (1-9) using your keyboard or the number pad.</p>
                  <p>2. Provide at least <strong className="text-foreground">17 clues</strong>.</p>
                  <p>3. Select the desired <strong className="text-foreground">grid variant</strong> and click <strong className="text-foreground">Solve Puzzle</strong> to analyze.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {phase === "done" && step && (
          <>
            <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground font-bold">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="flex items-center gap-2">
                  {variant !== "classic" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">{variant}</span>
                  )}
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {currentStep === totalSteps - 1 ? "Completed ✓" : "Solving..."}
                  </span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleStepChange(currentStep - 1)}
                  disabled={currentStep === 0}
                  className="flex-1 h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary disabled:opacity-40 transition-all active:scale-95"
                >
                  ← Back
                </button>
                <button
                  onClick={() => handleStepChange(currentStep + 1)}
                  disabled={currentStep === totalSteps - 1}
                  className="flex-1 h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary disabled:opacity-40 transition-all active:scale-95"
                >
                  Next →
                </button>
                <button
                  onClick={() => handleStepChange(0)}
                  disabled={currentStep === 0}
                  className="h-11 w-11 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary disabled:opacity-40 transition-all active:scale-95"
                  title="First step"
                >
                  ⟪
                </button>
                <button
                  onClick={() => handleStepChange(totalSteps - 1)}
                  disabled={currentStep === totalSteps - 1}
                  className="h-11 w-11 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary disabled:opacity-40 transition-all active:scale-95"
                  title="Last step"
                >
                  ⟫
                </button>
              </div>
            </div>

            <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={strategyBadgeColor(step.strategyName) + " text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border border-current/10"}>
                  {step.strategyName.replace(/_/g, " ")}
                </span>
                {step.isFallbackUsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 uppercase tracking-wide">fallback</span>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-semibold">{step.description}</p>

              {step.mutations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Grid Mutations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.mutations.map((m, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg border border-border text-[10px] font-mono font-bold bg-secondary text-foreground">
                        {m.action === "SET_VALUE" ? (
                          <>Set <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{m.digit}</span> at {m.cell}</>
                        ) : (
                          <>Remove <span className="text-rose-500 font-extrabold">&times;{m.digit}</span> at {m.cell}</>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.proofChain && step.proofChain.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Proof Chain</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.proofChain.map((p, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-secondary border border-border text-foreground">
                        {p.cell} : {p.digit}
                        {p.state !== "neutral" && (
                          <span className={p.state === "trial" ? "text-blue-500" : "text-rose-500"}>
                            {" "}({p.state})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const info = getStrategyInfo(step.strategyName);
                if (!info.description) return null;
                return (
                  <details className="group border-t border-border pt-3">
                    <summary className="text-xs font-bold text-primary cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:underline transition-all select-none">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        Learn Strategy Logic
                      </span>
                    </summary>
                    <div className="mt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed font-medium">
                      <p className="text-foreground/80">{info.description}</p>
                      <div>
                        <p className="font-bold text-foreground mb-1">Logical Deduction</p>
                        <p>{info.howItWorks}</p>
                      </div>
                      {info.example && (
                        <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                          <p className="font-bold text-foreground mb-1">Example Case</p>
                          <p>{info.example}</p>
                        </div>
                      )}
                    </div>
                  </details>
                );
              })()}
            </div>

            <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Map Legend</p>
              <div className="space-y-2.5 text-xs text-muted-foreground font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-400" />
                  <span>Cell resolved in this step</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-rose-100 dark:bg-rose-950/30 border border-rose-400" />
                  <span>Eliminated cell candidate or conflict</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-rose-100 dark:bg-rose-950/30 relative flex items-center justify-center">
                    <span className="absolute w-3.5 h-0.5 bg-rose-500 rotate-45 rounded-full" />
                    <span className="absolute w-3.5 h-0.5 bg-rose-500 -rotate-45 rounded-full" />
                  </div>
                  <span>Eliminated candidate details</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function SolverClient() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-57px)] bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-semibold">Loading SudoZen Solver...</div>
      </div>
    }>
      <SolverInner />
    </Suspense>
  );
}
