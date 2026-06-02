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
import { GameToolbar } from "@/components/play/game-toolbar";
import { ConflictModeSelector } from "@/components/play/conflict-mode-selector";
import { ActionRow } from "@/components/play/action-row";
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
}

export function PlayGame({ initialPuzzle, initialSolution, cages, hideDifficulty, onNewGame: onNewGameProp, variant, constraints }: PlayGameProps) {
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
  const [phase, setPhase] = useState<"idle" | "playing" | "submitting" | "correct" | "wrong">("idle");
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [puzzleString, setPuzzleString] = useState<string>("");
  const [solution, setSolution] = useState<string | null>(null);
  const [activeHint, setActiveHint] = useState<HintStep | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
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

  const fmtTime = (s: number) => {
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
        @media print {
          body * { visibility: hidden; }
          .print-grid-area, .print-grid-area * { visibility: visible; }
          .print-grid-area { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
          .cage-border { border-color: #000 !important; }
        }
      `}</style>
      <div className="min-h-[calc(100dvh-57px)] bg-background flex flex-col lg:flex-row items-center justify-center py-2 lg:py-6 px-2 sm:px-4 lg:px-8 gap-4 lg:gap-8 max-w-6xl mx-auto w-full transition-colors duration-200">
        <div className="flex flex-col gap-3 w-full max-w-[500px] lg:hidden">
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
          />
          <GameToolbar
            undoDisabled={undoStack.length === 0 || phase !== "playing"}
            redoDisabled={redoStack.length === 0 || phase !== "playing"}
            phase={phase}
            mistakesSize={mistakes.size}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSelectAll={handleSelectAll}
            onPrint={handlePrint}
            onExport={handleExport}
            onSubmit={handleSubmit}
            onSolve={handleSolve}
          />
        </div>

        <div className="w-full max-w-[500px] lg:max-w-[650px] lg:flex-1 relative mb-2 lg:mb-0 lg:flex lg:flex-col lg:items-center lg:justify-center print-grid-area">
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
          {phase === "correct" && (
            <SuccessOverlay
              difficulty={difficulty}
              elapsed={elapsed}
              fmtTime={fmtTime}
              onPlayAgain={() => newGame()}
            />
          )}
          {paused && (
            <PauseOverlay
              elapsed={elapsed}
              fmtTime={fmtTime}
              onResume={handlePauseToggle}
            />
          )}
        </div>

        <div className="w-full max-w-[500px] lg:w-[360px] lg:shrink-0 flex flex-col gap-4">
          <div className="hidden lg:flex flex-col gap-3">
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

            <GameToolbar
              undoDisabled={undoStack.length === 0 || phase !== "playing"}
              redoDisabled={redoStack.length === 0 || phase !== "playing"}
              phase={phase}
              mistakesSize={mistakes.size}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSelectAll={handleSelectAll}
              onPrint={handlePrint}
              onExport={handleExport}
              onSubmit={handleSubmit}
              onSolve={handleSolve}
            />
          </div>

          <ConflictModeSelector
            value={conflictMode}
            onChange={setConflictMode}
          />

          <ActionRow
            phase={phase}
            loading={loading}
            inputMode={inputMode}
            onPencilToggle={handlePencilToggle}
            onCenterToggle={handleCenterToggle}
            onErase={handleErase}
            onClear={handleClear}
            onHint={handleGetHint}
            onAutoFill={handleAutoFillNotes}
            hintDisabled={!!(cages && cages.length > 0)}
          />

          {activeHint && (
            <HintPanel
              activeHint={activeHint}
              onDismiss={handleDismissHint}
              onApply={handleApplyHint}
            />
          )}

          <NumberPad
            phase={phase}
            numberStamp={numberStamp}
            onNumberClick={handleNumberClick}
          />

          <ColorPicker
            phase={phase}
            onApplyColor={handleApplyColor}
            onEraseColor={handleEraseColor}
          />

          <CompletedDialog
            open={showCompletedDialog}
            onOpenChange={setShowCompletedDialog}
          />
        </div>
      </div>

      <RulesSidebar open={rulesOpen} onClose={() => setRulesOpen(false)} variant={variant} />
    </>
  );
}
