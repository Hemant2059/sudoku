"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SudokuGrid } from "@/components/sudoku-grid";
import { useToast } from "@/components/toast";
import type {
  Difficulty,
  CellState,
  InputMode,
  HintStep,
  HintHighlights,
  SolveStepMutation,
  SolveStep,
  Cage,
  VariantConstraints,
} from "@/lib/types";
import {
  EMPTY_CELL,
  puzzleStringToCells,
  cellsToUserSolution,
  findConflicts,
  findCageConflicts,
  findDiagonalConflicts,
  findHyperConflicts,
  findAntiKnightConflicts,
  findAntiKingConflicts,
  allCandidates,
  parseR1C1,
  computeHintHighlights,
  deepCloneCells,
  toggleColor,
} from "@/lib/sudoku";
import { GameHeader } from "@/components/play/game-header";
import { ConflictModeSelector } from "@/components/play/conflict-mode-selector";
import { NumberPad } from "@/components/play/number-pad";
import { ColorPicker } from "@/components/play/color-picker";
import { HintPanel } from "@/components/play/hint-panel";
import { CompletedDialog } from "@/components/play/completed-dialog";
import { SuccessOverlay } from "@/components/play/success-overlay";
import { PauseOverlay } from "@/components/play/pause-overlay";
import { RulesSidebar } from "@/components/play/rules-sidebar";

function computeConflicts(
  cells: CellState[],
  mode: "peer" | "answer" | "none",
  solution: string | null,
  cages?: Cage[],
  variant?: string,
): Set<number> {
  const conflicts = new Set<number>();
  if (mode !== "none") {
    if (mode === "peer") {
      for (const ci of findConflicts(cells)) conflicts.add(ci);
    } else if (solution) {
      for (let i = 0; i < 81; i++) {
        if (cells[i].given) continue;
        if (cells[i].value !== null && cells[i].value !== parseInt(solution[i])) {
          conflicts.add(i);
        }
      }
    }
  }
  if (cages && cages.length > 0) {
    for (const ci of findCageConflicts(cells, cages)) conflicts.add(ci);
  }
  if (variant === "xsudoku") {
    for (const ci of findDiagonalConflicts(cells)) conflicts.add(ci);
  } else if (variant === "hyper") {
    for (const ci of findHyperConflicts(cells)) conflicts.add(ci);
  } else if (variant === "antiknight") {
    for (const ci of findAntiKnightConflicts(cells)) conflicts.add(ci);
  } else if (variant === "antiking") {
    for (const ci of findAntiKingConflicts(cells)) conflicts.add(ci);
  }
  return conflicts;
}

const GRADER_LEVELS = ["EASY", "MEDIUM", "HARD", "EXPERT", "MASTER", "EXTREME"] as const;

interface PlayGameProps {
  initialPuzzle?: string;
  initialSolution?: string;
  cages?: Cage[];
  hideDifficulty?: boolean;
  onNewGame?: () => void;
  variant?: string;
  constraints?: VariantConstraints;
  maxTime?: number;
}

export function PlayGame({ initialPuzzle, initialSolution, cages, hideDifficulty, onNewGame: onNewGameProp, variant, constraints, maxTime }: PlayGameProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [cells, setCells] = useState<CellState[]>(() =>
    Array.from({ length: 81 }, () => EMPTY_CELL())
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [displayDifficulty, setDisplayDifficulty] = useState("MEDIUM");
  const [inputMode, setInputMode] = useState<InputMode>("VALUE");
  const [numberStamp, setNumberStamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [numMoves, setNumMoves] = useState(0);
  const [phase, setPhase] = useState<"idle" | "playing" | "submitting" | "correct" | "wrong" | "timeout">("idle");
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [puzzleString, setPuzzleString] = useState<string>("");
  const [solution, setSolution] = useState<string | null>(null);
  const [activeHint, setActiveHint] = useState<HintStep | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [conflictMode, setConflictMode] = useState<"peer" | "answer" | "none">("peer");
  const conflictModeRef = useRef(conflictMode);
  conflictModeRef.current = conflictMode;
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const selectedColorRef = useRef(selectedColor);
  selectedColorRef.current = selectedColor;
  const [rulesOpen, setRulesOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintIndexRef = useRef(0);
  const stepsRef = useRef<SolveStep[]>([]);

  const [undoStack, setUndoStack] = useState<CellState[][]>([]);
  const [redoStack, setRedoStack] = useState<CellState[][]>([]);

  const cellsRef = useRef(cells);
  cellsRef.current = cells;
  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;
  const selectedIndicesRef = useRef(selectedIndices);
  selectedIndicesRef.current = selectedIndices;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const solutionRef = useRef(solution);
  solutionRef.current = solution;
  const puzzleRef = useRef(puzzleString);
  puzzleRef.current = puzzleString;
  const inputModeRef = useRef(inputMode);
  inputModeRef.current = inputMode;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const cagesRef = useRef(cages);
  cagesRef.current = cages;
  const variantRef = useRef(variant);
  variantRef.current = variant;

  const constraintsRef = useRef(constraints);
  constraintsRef.current = constraints;

  const lastTapTime = useRef<Record<number, number>>({});

  const pushUndo = useCallback((grid: CellState[]) => {
    setUndoStack((prev) => {
      const next = prev.slice(-99);
      next.push(deepCloneCells(grid));
      return next;
    });
    setRedoStack([]);
  }, []);

  const newGame = useCallback(async (genDifficulty?: Difficulty) => {
    const diff = genDifficulty ?? difficultyRef.current;
    setLoading(true);
    setPhase("idle");
    setMistakes(new Set());
    setSolution(null);
    setNumMoves(0);
    setActiveHint(null);
    setPaused(false);
    setElapsed(0);
    hintIndexRef.current = 0;
    stepsRef.current = [];
    setUndoStack([]);
    setRedoStack([]);
    setNumberStamp(null);
    setInputMode("VALUE");
    try {
      const res = await fetch(`/api/generate?difficulty=${diff}`);
      const data = await res.json() as { command: string; data: { puzzle: string; solution: string; numClues: number; message?: string } };
      if (data.command === "error") throw new Error(data.data.message);
      const puzzle = data.data.puzzle as string;
      const newCells = puzzleStringToCells(puzzle);
      setCells(newCells);
      cellsRef.current = newCells;
      setSolution(data.data.solution);
      setPuzzleString(puzzle);
      puzzleRef.current = puzzle;
      setSelectedIndex(null);
      selectedRef.current = null;
      setPhase("playing");
    } catch (e) {
      console.error(e);
      toast("Failed to generate puzzle. Check that the Rust binary is built.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (phase === "idle") {
      if (initialPuzzle) {
        const newCells = puzzleStringToCells(initialPuzzle);
        setCells(newCells);
        cellsRef.current = newCells;
        setSolution(initialSolution ?? null);
        setPuzzleString(initialPuzzle);
        puzzleRef.current = initialPuzzle;
        setSelectedIndex(null);
        selectedRef.current = null;
        setPhase("playing");
      } else {
        newGame();
      }
    }
  }, [phase, newGame, initialPuzzle, initialSolution]);

  const handleCellClick = useCallback(
    (index: number, { ctrlKey, metaKey }: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
      if (phaseRef.current !== "playing" || pausedRef.current) return;
      setActiveHint(null);
      const cell = cellsRef.current[index];
      const multi = ctrlKey || metaKey;

      if (selectedColorRef.current !== null && cell) {
        const sc = selectedColorRef.current;
        const targets = multi
          ? new Set([...selectedIndicesRef.current, index])
          : new Set([index]);
        pushUndo(cellsRef.current);
        setCells((prev) => {
          const next = [...prev];
          for (const t of targets) {
            next[t] = { ...next[t], colors: toggleColor(next[t].colors, sc) };
          }
          return next;
        });
        setSelectedIndex(index);
        selectedRef.current = index;
        setSelectedIndices(targets);
        selectedIndicesRef.current = targets;
        setNumMoves((m) => m + 1);
        return;
      }

      if (numberStamp !== null && cell && !cell.given) {
        const targets = multi && inputModeRef.current === "PENCIL"
          ? new Set([...selectedIndicesRef.current, index])
          : new Set([index]);
        pushUndo(cellsRef.current);
        setCells((prevCells) => {
          const next = prevCells.map((c) => ({
            ...c,
            candidates: new Set(c.candidates),
            centerMarks: new Set(c.centerMarks),
            conflict: false,
          }));
          for (const t of targets) {
            if (next[t].given) continue;
            if (inputModeRef.current === "PENCIL") {
              if (next[t].candidates.has(numberStamp)) {
                next[t].candidates.delete(numberStamp);
              } else {
                next[t].candidates.add(numberStamp);
              }
            } else if (inputModeRef.current === "CENTER") {
              if (next[t].centerMarks.has(numberStamp)) {
                next[t].centerMarks.delete(numberStamp);
              } else {
                next[t].centerMarks.add(numberStamp);
              }
            } else if (t === index) {
              next[t].value = numberStamp;
              next[t].candidates = new Set();
            }
          }
          for (const ci of computeConflicts(next, conflictModeRef.current, solutionRef.current, cagesRef.current, variantRef.current)) {
            next[ci].conflict = true;
          }
          return next;
        });
        setSelectedIndex(index);
        selectedRef.current = index;
        setSelectedIndices(targets);
        selectedIndicesRef.current = targets;
        setNumMoves((m) => m + 1);
        return;
      }

      if (multi) {
        setSelectedIndices((prev) => {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
          return next;
        });
      } else {
        setSelectedIndices(new Set([index]));
      }
      setSelectedIndex(index);
      selectedRef.current = index;
    },
    [numberStamp, pushUndo, selectedColor]
  );

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleCellPointerDown = useCallback(
    (index: number) => {
      if (phaseRef.current !== "playing") return;
      const cell = cellsRef.current[index];
      if (!cell || cell.given) return;
      longPressTimer.current = setTimeout(() => {
        pushUndo(cellsRef.current);
        setCells((prev) => {
          const next = prev.map((c) => ({
            ...c,
            candidates: new Set(c.candidates),
            centerMarks: new Set(c.centerMarks),
            conflict: false,
          }));
          next[index].value = null;
          next[index].candidates = new Set();
          next[index].centerMarks = new Set();
          return next;
        });
        setNumMoves((m) => m + 1);
        longPressTimer.current = null;
      }, 300);
    },
    [pushUndo]
  );
  const handleCellPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const applyNumber = useCallback(
    (n: number) => {
      if (phaseRef.current !== "playing") return;
      const indices = selectedIndicesRef.current;
      if (indices.size === 0) return;

      pushUndo(cellsRef.current);
      setNumMoves((m) => m + 1);
      setCells((prev) => {
        const next = prev.map((c) => ({
          ...c,
          candidates: new Set(c.candidates),
          centerMarks: new Set(c.centerMarks),
          conflict: false,
        }));
        if (inputModeRef.current === "PENCIL") {
          for (const idx of indices) {
            if (next[idx].given) continue;
            if (next[idx].candidates.has(n)) {
              next[idx].candidates.delete(n);
            } else {
              next[idx].candidates.add(n);
            }
          }
        } else if (inputModeRef.current === "CENTER") {
          for (const idx of indices) {
            if (next[idx].given) continue;
            next[idx].candidates = new Set(next[idx].candidates);
            next[idx].centerMarks = new Set(next[idx].centerMarks);
            if (next[idx].centerMarks.has(n)) {
              next[idx].centerMarks.delete(n);
            } else {
              next[idx].centerMarks.add(n);
            }
          }
        } else {
          const idx = selectedRef.current!;
          if (next[idx].given) return prev;
          next[idx].value = n;
          next[idx].candidates = new Set();
          const row = Math.floor(idx / 9);
          const col = idx % 9;
          const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
          for (let i = 0; i < 81; i++) {
            if (i === idx || next[i].given || next[i].value) continue;
            const r = Math.floor(i / 9);
            const c = i % 9;
            const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
            if ((r === row || c === col || b === box) && next[i].candidates.has(n)) {
              const updated = new Set(next[i].candidates);
              updated.delete(n);
              next[i].candidates = updated;
            }
          }
        }
        for (const ci of computeConflicts(next, conflictModeRef.current, solutionRef.current, cagesRef.current, variantRef.current)) {
          next[ci].conflict = true;
        }
        return next;
      });
    },
    [pushUndo]
  );

  const handleErase = useCallback(() => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const indices = selectedIndicesRef.current;
    if (indices.size === 0) return;
    const hasNonGiven = [...indices].some((i) => {
      const cell = cellsRef.current[i];
      return cell && !cell.given;
    });
    if (!hasNonGiven) return;
    pushUndo(cellsRef.current);
    setNumMoves((m) => m + 1);
    setCells((prev) => {
      const next = prev.map((c) => ({
        ...c,
        candidates: new Set(c.candidates),
        centerMarks: new Set(c.centerMarks),
        conflict: false,
      }));
      for (const idx of indices) {
        if (next[idx].given) continue;
        next[idx].value = null;
        next[idx].candidates = new Set();
        next[idx].centerMarks = new Set();
        next[idx].colors = [];
      }
      for (const ci of computeConflicts(next, conflictModeRef.current, solutionRef.current, cagesRef.current, variantRef.current)) {
        next[ci].conflict = true;
      }
      return next;
    });
  }, [pushUndo]);

  const handlePencilToggle = useCallback(() => {
    setInputMode((m) => (m === "VALUE" ? "PENCIL" : "VALUE"));
    setNumberStamp(null);
  }, []);

  const handleCenterToggle = useCallback(() => {
    setInputMode((m) => (m === "CENTER" ? "VALUE" : "CENTER"));
    setNumberStamp(null);
  }, []);

  const handlePauseToggle = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const all = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (!cellsRef.current[i]?.given) all.add(i);
    }
    setSelectedIndices(all);
    selectedIndicesRef.current = all;
    if (all.size === 0) return;
    if (selectedRef.current === null || cellsRef.current[selectedRef.current]?.given) {
      const first = [...all][0]!;
      setSelectedIndex(first);
      selectedRef.current = first;
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevCells = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, deepCloneCells(cellsRef.current)]);
    setCells(prevCells);
    cellsRef.current = prevCells;
    setActiveHint(null);
    if (hintIndexRef.current > 0) hintIndexRef.current--;
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextCells = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, deepCloneCells(cellsRef.current)]);
    setCells(nextCells);
    cellsRef.current = nextCells;
  }, [redoStack]);

  const handleAutoFillNotes = useCallback(() => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    pushUndo(cellsRef.current);
    setNumMoves((m) => m + 1);
    const updated = allCandidates(cellsRef.current);
    setCells(updated);
    cellsRef.current = updated;
  }, [pushUndo]);

  const handleApplyColor = useCallback((color: string) => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const indices = selectedIndicesRef.current;
    if (indices.size > 0) {
      pushUndo(cellsRef.current);
      setNumMoves((m) => m + 1);
      setCells((prev) => {
        const next = [...prev];
        for (const idx of indices) {
          next[idx] = { ...next[idx], colors: toggleColor(next[idx].colors, color) };
        }
        return next;
      });
    }
    setSelectedColor(color);
  }, [pushUndo]);

  const handleEraseColor = useCallback(() => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const indices = selectedIndicesRef.current;
    if (indices.size === 0) return;
    pushUndo(cellsRef.current);
    setNumMoves((m) => m + 1);
    setCells((prev) => {
      const next = [...prev];
      for (const idx of indices) {
        next[idx] = { ...next[idx], colors: [] };
      }
      return next;
    });
  }, [pushUndo]);

  const handleClear = useCallback(() => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const puzzle = puzzleRef.current;
    if (!puzzle) return;
    pushUndo(cellsRef.current);
    setNumMoves((m) => m + 1);
    const cleared = puzzleStringToCells(puzzle);
    setCells(cleared);
    cellsRef.current = cleared;
    setMistakes(new Set());
    setActiveHint(null);
    hintIndexRef.current = 0;
    stepsRef.current = [];
  }, [pushUndo]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    const cur = cellsRef.current;
    const puzzle = puzzleRef.current;
    if (!puzzle) return;
    const values = cur.map((c) => (c.given ? c.value!.toString() : ".")).join("");
    const cellColors: [number, string[]][] = [];
    cur.forEach((c, i) => { if (c.colors.length > 0) cellColors.push([i, c.colors]); });
    const data = { puzzle, values, cellColors, solution: solutionRef.current, difficulty: difficultyRef.current };
    navigator.clipboard.writeText(JSON.stringify(data));
    toast("Exported to clipboard.", "success");
  }, []);

  const hasPendingMutation = useCallback((step: SolveStep, current: CellState[]) => {
    return step.mutations.some((m) => {
      const idx = parseR1C1(m.cell);
      if (idx === null) return false;
      if (m.action === "SET_VALUE") return current[idx]?.value !== m.digit;
      return current[idx]?.candidates?.has(m.digit) ?? false;
    });
  }, []);

  const handleGetHint = useCallback(async () => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const puzzle = puzzleRef.current;
    if (!puzzle) { toast("No puzzle loaded."); return; }
    setLoading(true);
    try {
      if (stepsRef.current.length === 0) {
        const v = variantRef.current;
        const endpoint = v && v !== "classic" ? "/api/variant/solve" : "/api/solve";
        const body: any = { puzzle };
        if (v && v !== "classic") body.variant = v;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.command === "error") throw new Error(data.data.message);
        const result: { steps: SolveStep[] } = data.data;
        stepsRef.current = result.steps || [];
      }
      const steps = stepsRef.current;
      if (steps.length === 0) {
        toast("No hint steps available.");
        return;
      }
      const current = cellsRef.current;
      let stepIndex = -1;
      for (let i = hintIndexRef.current; i < steps.length; i++) {
        if (hasPendingMutation(steps[i], current)) {
          stepIndex = i;
          break;
        }
      }
      if (stepIndex === -1) {
        for (let i = 0; i < hintIndexRef.current; i++) {
          if (hasPendingMutation(steps[i], current)) {
            stepIndex = i;
            break;
          }
        }
      }
      if (stepIndex === -1) {
        setShowCompletedDialog(true);
        setLoading(false);
        return;
      }
      hintIndexRef.current = stepIndex + 1;
      const step = steps[stepIndex];
      const uiHighlights = computeHintHighlights(step.mutations, step.proofChain, step.description, current);
      setActiveHint({
        stepNumber: step.stepNumber,
        strategyName: step.strategyName,
        isFallbackUsed: step.isFallbackUsed,
        description: step.description,
        mutations: step.mutations,
        proofChain: step.proofChain,
        uiHighlights,
      });
    } catch (e) {
      console.error(e);
      toast("Failed to get hint.");
    }
    setLoading(false);
  }, [hasPendingMutation]);

  const handleApplyHint = useCallback(() => {
    if (!activeHint || phaseRef.current !== "playing") return;
    const current = cellsRef.current;
    const pending = activeHint.mutations.filter((m) => {
      const idx = parseR1C1(m.cell);
      if (idx === null) return false;
      if (m.action === "SET_VALUE") return current[idx]?.value !== m.digit;
      return current[idx]?.candidates?.has(m.digit) ?? false;
    });
    if (pending.length === 0) return;
    pushUndo(current);
    const next = current.map((c) => ({
      ...c,
      candidates: new Set(c.candidates),
      centerMarks: new Set(c.centerMarks),
      conflict: false,
    }));
    for (const m of pending) {
      const idx = parseR1C1(m.cell);
      if (idx === null || next[idx].given) continue;
      if (m.action === "SET_VALUE") {
        next[idx].value = m.digit;
        next[idx].candidates = new Set();
      } else {
        const s = new Set(next[idx].candidates);
        s.delete(m.digit);
        next[idx].candidates = s;
      }
    }
    const conflicts = computeConflicts(next, conflictModeRef.current, solutionRef.current, cagesRef.current, variantRef.current);
    for (let i = 0; i < 81; i++) next[i].conflict = conflicts.has(i);
    setCells(next);
    cellsRef.current = next;
    setNumMoves((m) => m + 1);
    setActiveHint(null);
  }, [activeHint, pushUndo]);

  const handleDismissHint = useCallback(() => {
    setActiveHint(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (phaseRef.current !== "playing" || pausedRef.current) return;
    const curCells = cellsRef.current;
    const expected = solutionRef.current;
    if (!expected) { toast("No solution available."); return; }
    const emptyCount = curCells.filter((c) => c.value === null).length;
    if (emptyCount > 0) {
      toast(`Fill all cells first (${emptyCount} empty).`);
      return;
    }
    setPhase("submitting");
    const userSolution = cellsToUserSolution(curCells);
    if (userSolution === expected) {
      setPhase("correct");
    } else {
      const diffs = new Set<number>();
      for (let i = 0; i < 81; i++) {
        const uc = userSolution[i];
        const ec = expected[i];
        if (uc !== "." && uc !== ec) diffs.add(i);
      }
      setPhase("wrong");
      setMistakes(diffs);
      setCells((prev) => prev.map((c, i) => ({ ...c, conflict: diffs.has(i) })));
    }
  }, []);

  const handleSolve = useCallback(() => {
    const puzzle = puzzleRef.current;
    if (!puzzle) { toast("No puzzle to solve."); return; }
    const v = variantRef.current;
    const params = new URLSearchParams({ puzzle });
    if (v && v !== "classic" && v !== "killer") {
      params.set("variant", v);
      const c = constraintsRef.current;
      if (c) {
        const json = JSON.stringify(c);
        if (json.length < 2000) params.set("constraints", json);
      }
    }
    router.push(`/solver?${params.toString()}`);
  }, [router]);

  const handleNumberClick = useCallback(
    (n: number) => {
      if (pausedRef.current) return;
      const now = Date.now();
      const last = lastTapTime.current[n] || 0;
      lastTapTime.current[n] = now;

      if (now - last < 300) {
        setNumberStamp((prev) => (prev === n ? null : n));
        return;
      }

      if (numberStamp !== null) {
        setNumberStamp(null);
      }
      applyNumber(n);
    },
    [numberStamp, applyNumber]
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (pausedRef.current) {
        if (e.key === "Escape") {
          setActiveHint(null);
          setSelectedIndex(null);
          setSelectedIndices(new Set());
        }
        return;
      }
      if (phaseRef.current !== "playing") {
        if (e.key === "Escape") {
          setActiveHint(null);
          setSelectedIndex(null);
          setSelectedIndices(new Set());
        }
        return;
      }

      const cur = selectedRef.current;

      if (e.key === "Escape") {
        e.preventDefault();
        setActiveHint(null);
        setSelectedIndex(null);
        selectedRef.current = null;
        setSelectedIndices(new Set());
        selectedIndicesRef.current = new Set();
        setNumberStamp(null);
        return;
      }

      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        handleGetHint();
        return;
      }

      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        handleSelectAll();
        return;
      }

      if (activeHint) setActiveHint(null);

      if (cur === null) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "s", "S", "a", "A", "d", "D"].includes(e.key)) {
          e.preventDefault();
          setSelectedIndex(40);
          selectedRef.current = 40;
          setSelectedIndices(new Set([40]));
        }
        return;
      }

      const row = Math.floor(cur / 9);
      const col = cur % 9;

      const moveTo = (next: number) => {
        setSelectedIndex(next);
        selectedRef.current = next;
        if (e.shiftKey) {
          setSelectedIndices((prev) => {
            const s = new Set(prev);
            s.add(next);
            return s;
          });
        } else {
          setSelectedIndices(new Set([next]));
        }
      };

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        const next = col === 0 ? row * 9 + 8 : cur - 1;
        moveTo(next);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        const next = col === 8 ? row * 9 : cur + 1;
        moveTo(next);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        const next = row === 0 ? 72 + col : cur - 9;
        moveTo(next);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        const next = row === 8 ? col : cur + 9;
        moveTo(next);
        return;
      }

      let num = parseInt(e.key);
      if (isNaN(num) || num < 1 || num > 9) {
        const m = e.code.match(/^Digit(\d)$/);
        if (m) num = parseInt(m[1]);
      }
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        if (e.shiftKey) {
          const indices = selectedIndicesRef.current;
          if (indices.size === 0) return;
          pushUndo(cellsRef.current);
          setNumMoves((m) => m + 1);
          setCells((prev) => {
            const next = prev.map((c) => ({
              ...c,
              candidates: new Set(c.candidates),
              centerMarks: new Set(c.centerMarks),
              conflict: false,
            }));
            for (const idx of indices) {
              if (next[idx].given) continue;
              if (next[idx].candidates.has(num)) {
                next[idx].candidates.delete(num);
              } else {
                next[idx].candidates.add(num);
              }
            }
          for (const ci of computeConflicts(next, conflictModeRef.current, solutionRef.current, cagesRef.current, variantRef.current)) {
            next[ci].conflict = true;
          }
          return next;
          });
        } else if (e.ctrlKey || e.metaKey) {
          const indices = selectedIndicesRef.current;
          if (indices.size === 0) return;
          pushUndo(cellsRef.current);
          setNumMoves((m) => m + 1);
          setCells((prev) => {
            const next = prev.map((c) => ({
              ...c,
              candidates: new Set(c.candidates),
              centerMarks: new Set(c.centerMarks),
              conflict: false,
            }));
            for (const idx of indices) {
              if (next[idx].given) continue;
              if (next[idx].centerMarks.has(num)) {
                next[idx].centerMarks.delete(num);
              } else {
                next[idx].centerMarks.add(num);
              }
            }
            for (const ci of computeConflicts(next, conflictModeRef.current, solutionRef.current, cagesRef.current, variantRef.current)) {
              next[ci].conflict = true;
            }
            return next;
          });
        } else {
          applyNumber(num);
        }
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        handleErase();
        return;
      }
    },
    [activeHint, handleGetHint, handleUndo, handleRedo, applyNumber, handleErase, pushUndo, handleSelectAll]
  );

  useEffect(() => {
    if (phase === "playing" && !paused) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, paused]);

  useEffect(() => {
    if (maxTime && phase === "playing" && elapsed >= maxTime) {
      setPhase("timeout");
    }
  }, [elapsed, maxTime, phase]);

  const remainingTime = maxTime ? Math.max(0, maxTime - elapsed) : null;

  const fmtTime = (s: number) => {
    const val = remainingTime !== null ? remainingTime : s;
    const m = Math.floor(val / 60);
    const sec = val % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const fmtElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleHeaderNewGame = useCallback(() => {
    if (onNewGameProp) onNewGameProp();
    else newGame();
  }, [onNewGameProp, newGame]);

  const levelToGenDifficulty = (level: string): Difficulty => {
    if (level === "EASY") return "easy";
    if (level === "MEDIUM") return "medium";
    if (level === "HARD") return "hard";
    return "expert";
  };

  const handleDifficultyChange = useCallback((level: string) => {
    if (!level || loading) return;
    setDisplayDifficulty(level);
    const genDiff = levelToGenDifficulty(level);
    setDifficulty(genDiff);
    newGame(genDiff);
  }, [loading, newGame]);

  return (
    <>
      <style>{`
        body.fs-active header.sticky { display: none !important; }
        @media print {
          body * { visibility: hidden; }
          .print-grid-area, .print-grid-area * { visibility: visible; }
          .print-grid-area { position: fixed !important; inset: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: white !important; z-index: 9999 !important; padding: 0 !important; }
          .print-grid-area > div { max-width: none !important; width: 95vmin !important; }
          .print-grid-area button > span { font-size: clamp(28px, 5vw, 48px) !important; }
          .print-grid-area .grid-cols-3 > span { font-size: clamp(12px, 2.5vw, 22px) !important; }
          .cage-border { border-color: #000 !important; }
        }
      `}</style>
      <div className="min-h-0 flex-1 bg-background flex flex-col transition-colors duration-200 overflow-x-hidden">
        {/* Header bar - floating overlay style */}
        <div className="shrink-0 pt-1.5 px-2 sm:px-3">
          <div className="max-w-xl mx-auto shadow-sm border border-border bg-background/95 backdrop-blur rounded-xl px-2 py-1">
            <GameHeader
            displayDifficulty={displayDifficulty}
            loading={loading}
            graderLevels={hideDifficulty ? undefined : GRADER_LEVELS}
            onDifficultyChange={handleDifficultyChange}
            onNewGame={handleHeaderNewGame}
            elapsed={elapsed}
            paused={paused}
            onPauseToggle={handlePauseToggle}
            fmtTime={fmtTime}
            onOpenRules={() => setRulesOpen(true)}
            hideDifficulty={hideDifficulty}
          />
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Grid area */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-3 lg:p-4 min-h-0 print-grid-area">
            <div className="w-full max-w-[min(550px,calc(100vw-16px),65dvh)] lg:max-w-[min(78dvh,800px)]">
              <SudokuGrid
                cells={cells}
                selectedIndex={selectedIndex}
                multiSelectedIndices={selectedIndices.size > 1 ? selectedIndices : undefined}
                onCellClick={handleCellClick}
                onKeyDown={handleGridKeyDown}
                onCellPointerDown={handleCellPointerDown}
                onCellPointerUp={handleCellPointerUp}
                inputMode={inputMode}
                hintHighlights={activeHint?.uiHighlights ?? null}
                solved={phase === "correct"}
                cages={cages}
                variant={variant}
                constraints={constraints}
              />
            </div>
            {phase === "correct" && (
              <SuccessOverlay
                difficulty={difficulty}
                elapsed={elapsed}
                fmtTime={fmtElapsed}
                onPlayAgain={() => newGame()}
              />
            )}
            {phase === "timeout" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl animate-in fade-in duration-200">
                <div className="text-center p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-orange-200 dark:border-orange-900/30 transform scale-100 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Time&apos;s Up!</h3>
                  <p className="text-sm text-slate-500 mb-6">You ran out of time. Try again?</p>
                  <button onClick={handleHeaderNewGame} className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/25">Play Again</button>
                </div>
              </div>
            )}
            {paused && (
              <PauseOverlay
                elapsed={elapsed}
                fmtTime={fmtElapsed}
                onResume={handlePauseToggle}
              />
            )}
          </div>

          {/* Controls panel */}
          <div className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-background p-2 sm:p-3 flex flex-col gap-2">
            {/* Unified action bar - large buttons with keyboard shortcuts */}
            <div className="grid grid-cols-4 gap-1.5">
              <button onClick={handleUndo} disabled={undoStack.length === 0 || phase !== "playing"} className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex flex-col items-center justify-center" title="Undo">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Ctrl+Z</span>
              </button>
              <button onClick={handleRedo} disabled={redoStack.length === 0 || phase !== "playing"} className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex flex-col items-center justify-center" title="Redo">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Ctrl+Y</span>
              </button>
              <button onClick={handlePencilToggle} className={`h-12 rounded-xl border transition-colors flex flex-col items-center justify-center ${inputMode === "PENCIL" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-foreground hover:bg-secondary"}`} title="Notes mode">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Shift+1-9</span>
              </button>
              <button onClick={handleCenterToggle} className={`h-12 rounded-xl border transition-colors flex flex-col items-center justify-center ${inputMode === "CENTER" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-foreground hover:bg-secondary"}`} title="Center marks">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Ctrl+1-9</span>
              </button>
              <button onClick={handleErase} disabled={phase !== "playing"} className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex flex-col items-center justify-center" title="Erase">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Del</span>
              </button>
              <button onClick={handleAutoFillNotes} disabled={phase !== "playing"} className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex flex-col items-center justify-center" title="Auto-fill candidates">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Auto</span>
              </button>
              <button onClick={handleGetHint} disabled={phase !== "playing" || loading || !!(cages && cages.length > 0)} className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex flex-col items-center justify-center" title="Get a hint">
                {loading ? (
                  <svg className="animate-spin w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                )}
                <span className="text-[9px] leading-none text-muted-foreground">H</span>
              </button>
              <button onClick={handleSelectAll} disabled={phase !== "playing"} className="h-12 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex flex-col items-center justify-center" title="Select all">
                <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span className="text-[9px] leading-none text-muted-foreground">Ctrl+A</span>
              </button>
            </div>

            {/* NumberPad */}
            <NumberPad
              phase={phase}
              numberStamp={numberStamp}
              onNumberClick={handleNumberClick}
            />

            {/* Solve / Submit row */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={phase !== "playing"}
                className="flex-1 h-10 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Submit
              </button>
              <button
                onClick={handleSolve}
                disabled={!puzzleString}
                className="flex-1 h-10 rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                Solve
              </button>
            </div>

            {phase === "correct" && (
              <div className="text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 py-1">
                SOLVED!
              </div>
            )}
            {phase === "wrong" && (
              <div className="text-center text-[10px] font-bold text-red-500 py-1">
                {mistakes.size} ERRORS
              </div>
            )}
            {phase === "timeout" && (
              <div className="text-center text-[10px] font-bold text-orange-500 py-1">
                TIME UP!
              </div>
            )}

            {/* Tools & Settings collapsible */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
                onClick={() => setToolsOpen((open) => !open)}
              >
                <span>Tools & Settings</span>
                <span className="text-base leading-none">{toolsOpen ? "−" : "+"}</span>
              </button>
              {toolsOpen && (
                <div className="border-t border-border p-3 space-y-3">
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Validation</p>
                    <ConflictModeSelector
                      value={conflictMode}
                      onChange={setConflictMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Cell colors</p>
                    <ColorPicker
                      phase={phase}
                      onApplyColor={handleApplyColor}
                      onEraseColor={handleEraseColor}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Tools</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={handlePrint} className="h-9 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-secondary text-[10px] font-semibold transition-colors">Print</button>
                      <button onClick={handleExport} disabled={phase !== "playing"} className="h-9 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 text-[10px] font-semibold transition-colors">Export</button>
                      <button onClick={handleSelectAll} disabled={phase !== "playing"} className="h-9 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 text-[10px] font-semibold transition-colors">Select all</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hint panel */}
            {activeHint && (
              <HintPanel
                activeHint={activeHint}
                onDismiss={handleDismissHint}
                onApply={handleApplyHint}
              />
            )}

            <CompletedDialog
              open={showCompletedDialog}
              onOpenChange={setShowCompletedDialog}
            />
          </div>
        </div>
      </div>

      <RulesSidebar open={rulesOpen} onClose={() => setRulesOpen(false)} variant={variant} />
    </>
  );
}
