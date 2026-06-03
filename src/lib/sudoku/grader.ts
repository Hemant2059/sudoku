import { ExplanationCommand } from "./commands";
import { solveAndExplain, PipelineResult } from "./pipeline";
import { Grid } from "./types";

export enum SudokuDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXPERT = "EXPERT",
  MASTER = "MASTER",
  EXTREME = "EXTREME",
}

export interface GraderReport {
  assignedDifficulty: SudokuDifficulty;
  peakStrategyUsed: string;
  totalStepsRequired: number;
  strategyDistribution: Record<string, number>;
  completeSolutionPath: ExplanationCommand[];
}

function strategyTier(name: string): [SudokuDifficulty, string] {
  const upper = name.toUpperCase().replace(/ /g, "_");
  switch (upper) {
    case "NAKED_SINGLE": case "HIDDEN_SINGLE": return [SudokuDifficulty.EASY, "NAKED_SINGLE"];
    case "NAKED_SUBSET": case "POINTING_PAIR": return [SudokuDifficulty.MEDIUM, "SUBSET_INTERSECTION"];
    case "X-WING": case "X_WING": case "Y-WING": case "Y_WING": return [SudokuDifficulty.HARD, "X_WING"];
    case "SWORDFISH": case "UNIQUE_RECTANGLE": case "UNIQUE_RECTANGLE": return [SudokuDifficulty.EXPERT, "SWORDFISH"];
    case "ALTERNATING_INFERENCE_CHAIN": case "X-CYCLE": case "X_CYCLE":
    case "XY-CHAIN": case "XY_CHAIN": case "JELLYFISH": return [SudokuDifficulty.MASTER, "AIC"];
    case "DLX_CONTRADICTION_CHAIN": case "DLX_DIRECT_ASSIGNMENT": return [SudokuDifficulty.EXTREME, "DLX_FALLBACK"];
    default: return [SudokuDifficulty.HARD, "UNKNOWN"];
  }
}

function normalizeName(name: string): string {
  const upper = name.toUpperCase().replace(/ /g, "_");
  const map: Record<string, string> = {
    "NAKED_SINGLE": "NAKED_SINGLE", "HIDDEN_SINGLE": "HIDDEN_SINGLE",
    "NAKED_SUBSET": "NAKED_SUBSET", "POINTING_PAIR": "POINTING_PAIR",
    "X-WING": "X_WING", "X_WING": "X_WING",
    "Y-WING": "Y_WING", "Y_WING": "Y_WING",
    "SWORDFISH": "SWORDFISH", "UNIQUE_RECTANGLE": "UNIQUE_RECTANGLE",
    "ALTERNATING_INFERENCE_CHAIN": "ALTERNATING_INFERENCE_CHAIN",
    "X-CYCLE": "X_CYCLE", "X_CYCLE": "X_CYCLE",
    "XY-CHAIN": "XY_CHAIN", "XY_CHAIN": "XY_CHAIN",
    "JELLYFISH": "JELLYFISH",
    "DLX_CONTRADICTION_CHAIN": "DLX_CONTRADICTION_CHAIN",
    "DLX_DIRECT_ASSIGNMENT": "DLX_DIRECT_ASSIGNMENT",
  };
  return map[upper] || upper;
}

function tierOrder(t: SudokuDifficulty): number {
  const order: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2, EXPERT: 3, MASTER: 4, EXTREME: 5 };
  return order[t] ?? 0;
}

export function analyzeAndGradePuzzle(initialGrid: Grid): GraderReport {
  const result: PipelineResult = solveAndExplain(initialGrid.toString());
  const commands = result.commands;
  const totalSteps = commands.length;

  let peakTier = SudokuDifficulty.EASY;
  let peakStrategy = "NAKED_SINGLE";
  const distribution: Record<string, number> = {};

  for (const cmd of commands) {
    const [tier, canonical] = strategyTier(cmd.strategyName);
    const normal = normalizeName(cmd.strategyName);
    distribution[normal] = (distribution[normal] || 0) + 1;

    if (tierOrder(tier) > tierOrder(peakTier)) {
      peakTier = tier;
      peakStrategy = canonical;
    }
  }

  const hasDlx = commands.some(c => strategyTier(c.strategyName)[0] === SudokuDifficulty.EXTREME);
  if (hasDlx) {
    peakTier = SudokuDifficulty.EXTREME;
    peakStrategy = "DLX_FALLBACK";
  }

  if (totalSteps === 0) {
    throw new Error("No steps recorded; puzzle may be unsolvable.");
  }

  return {
    assignedDifficulty: peakTier,
    peakStrategyUsed: peakStrategy,
    totalStepsRequired: totalSteps,
    strategyDistribution: distribution,
    completeSolutionPath: commands,
  };
}

export function analyzeAndGradePuzzleString(puzzleStr: string): GraderReport {
  const grid = Grid.fromString(puzzleStr);
  return analyzeAndGradePuzzle(grid);
}
