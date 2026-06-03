import { generatePuzzle as genPuzzle, generateVariantPuzzle as genVariantPuzzle, verifySolutionGrids, Difficulty } from "./sudoku/generator";
import { solveAndExplain } from "./sudoku/pipeline";
import { analyzeAndGradePuzzleString } from "./sudoku/grader";
import { generateKillerPuzzle as genKillerPuzzle } from "./sudoku/killer";
import { solveVariant } from "./sudoku/backtrack";
import { solveVariantViaDlx, validateAndSolve } from "./sudoku/dlx";
import { Grid } from "./sudoku/types";
import { VariantType } from "./sudoku/variants";
import { emptyConstraints, type VariantConstraints } from "./sudoku/backtrack";
import { PipelineController } from "./sudoku/pipeline";
import type { GenerationResponse, SolveResponse, VerifyResponse } from "./types";

function difficultyFromString(s: string): Difficulty {
  switch (s.toLowerCase()) {
    case "easy": return Difficulty.Easy;
    case "medium": return Difficulty.Medium;
    case "hard": return Difficulty.Hard;
    case "expert": return Difficulty.Expert;
    default: return Difficulty.Medium;
  }
}

function variantFromString(s: string): VariantType {
  const map: Record<string, VariantType> = {
    classic: VariantType.Classic, xsudoku: VariantType.XSudoku, x: VariantType.XSudoku,
    diagonal: VariantType.XSudoku, hyper: VariantType.Hyper, windoku: VariantType.Hyper,
    antiknight: VariantType.AntiKnight, knight: VariantType.AntiKnight,
    antiking: VariantType.AntiKing, king: VariantType.AntiKing,
    thermo: VariantType.Thermo, arrow: VariantType.Arrow,
    palindrome: VariantType.Palindrome, renban: VariantType.Renban,
    kropki: VariantType.Kropki, xv: VariantType.XV,
    greaterthan: VariantType.GreaterThan,
  };
  return map[s.toLowerCase()] || VariantType.Classic;
}

function formatGenerated(gen: { puzzle: Grid; solution: Grid; difficulty: Difficulty; numClues: number; variant: VariantType; constraints: VariantConstraints | null }): any {
  const data: any = {
    puzzle: gen.puzzle.toString(),
    solution: gen.solution.toString(),
    difficulty: gen.difficulty,
    numClues: gen.numClues,
    variant: gen.variant,
  };
  if (gen.constraints) {
    const c = gen.constraints;
    const markings: any = {};
    if (c.palindromeLines.length > 0) markings.palindromeLines = c.palindromeLines;
    if (c.thermos.length > 0) markings.thermos = c.thermos;
    if (c.renbanLines.length > 0) markings.renbanLines = c.renbanLines;
    if (c.arrows.length > 0) {
      markings.arrows = c.arrows.map(a => ({ circle: a.circle, path: a.path }));
    }
    if (c.kropkiDots.length > 0) {
      markings.kropkiDots = c.kropkiDots.map(k => ({ a: k.a, b: k.b, kind: k.kind === 0 ? "white" : "black" }));
    }
    if (c.xvPairs.length > 0) {
      markings.xvPairs = c.xvPairs.map(x => ({ a: x.a, b: x.b, kind: x.kind === 0 ? "v" : "x" }));
    }
    if (c.greaterThan.length > 0) markings.greaterThan = c.greaterThan;
    if (Object.keys(markings).length > 0) data.constraints = markings;
  }
  return { command: "generate", data };
}

function formatSolveResult(puzzleStr: string, commands: any[], solvedGrid: string): any {
  const steps = commands.map((cmd: any, i: number) => ({
    stepNumber: i + 1,
    strategyName: cmd.strategyName,
    isFallbackUsed: cmd.isFallbackUsed,
    description: cmd.description,
    mutations: cmd.mutations,
    proofChain: cmd.logicalProofChain,
    uiHighlights: {
      greenCells: cmd.uiHighlights.greenCells,
      redCells: cmd.uiHighlights.redCells,
      eliminationCandidates: cmd.uiHighlights.eliminationCandidates,
    },
  }));
  return {
    command: "solve",
    data: { puzzle: puzzleStr, valid: true, solvedGrid, totalSteps: commands.length, steps },
  };
}

export function hashDateSeed(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function generateDailyPuzzle(): GenerationResponse {
  const dateStr = new Date().toISOString().slice(0, 10);
  const seed = hashDateSeed(dateStr);
  const gen = genPuzzle(difficultyFromString("medium"), seed);
  return formatGenerated(gen) as GenerationResponse;
}

export function generatePuzzle(difficulty: string): GenerationResponse {
  const gen = genPuzzle(difficultyFromString(difficulty));
  return formatGenerated(gen) as GenerationResponse;
}

export function generatePuzzleWithSolution(difficulty: string): { puzzle: string; solution: string; difficulty: string; numClues: number } {
  const gen = genPuzzle(difficultyFromString(difficulty));
  return { puzzle: gen.puzzle.toString(), solution: gen.solution.toString(), difficulty: gen.difficulty, numClues: gen.numClues };
}

export function solvePuzzle(puzzle: string): SolveResponse {
  const result = solveAndExplain(puzzle);
  return formatSolveResult(puzzle, result.commands, result.solvedGrid.toString()) as SolveResponse;
}

export function verifySolution(puzzle: string, solution: string): VerifyResponse {
  const p = Grid.fromString(puzzle);
  const s = Grid.fromString(solution);
  try {
    const msg = verifySolutionGrids(p, s);
    let expected: string | null = null;
    try { expected = validateAndSolve(p).toString(); } catch {}
    return { command: "verify", data: { puzzle, valid: true, userSolution: solution, expectedSolution: expected, message: msg, differences: [] } };
  } catch (e: any) {
    let expected: string | null = null;
    try { expected = validateAndSolve(p).toString(); } catch {}
    return { command: "verify", data: { puzzle, valid: false, userSolution: solution, expectedSolution: expected, message: e.message || String(e), differences: [] } };
  }
}

export function generateKillerPuzzle(): { command: string; data: { puzzle: string; solution: string; cages: { cells: number[]; sum: number }[] } } {
  const kp = genKillerPuzzle();
  return { command: "killer_generate", data: { puzzle: kp.puzzle, solution: kp.solution, cages: kp.cages } };
}

export function gradePuzzle(puzzle: string): { command: string; data: any } {
  const report = analyzeAndGradePuzzleString(puzzle);
  return { command: "grade", data: report };
}

export function generateVariantPuzzle(variant: string, difficulty: string): {
  command: string;
  data: { puzzle: string; solution: string; difficulty: string; numClues: number; variant: string; constraints?: any };
} {
  const v = variantFromString(variant);
  const d = difficultyFromString(difficulty);
  const gen = genVariantPuzzle(d, v);
  return formatGenerated(gen) as any;
}

export function solveVariantPuzzle(
  puzzle: string,
  variant: string,
  constraintsJson?: string,
): { command: string; data: any } {
  const grid = Grid.fromString(puzzle);
  const v = variantFromString(variant);

  let reference: Grid | null = null;
  try {
    if (v === VariantType.Classic) {
      reference = validateAndSolve(grid);
    } else {
      reference = solveVariantViaDlx(grid, variant);
      if (!reference) {
        let constraints = emptyConstraints();
        if (constraintsJson) {
          const parsed = JSON.parse(constraintsJson);
          constraints = parseConstraints(parsed);
        }
        const sols = solveVariant(grid, constraints, 1);
        if (sols.length > 0) reference = sols[0];
      }
    }
  } catch {}

  if (reference) {
    const controller = PipelineController.withSolution(grid, reference);
    try {
      const result = controller.run();
      return formatSolveResult(puzzle, result.commands, reference.toString()) as any;
    } catch {
      return formatSolveResult(puzzle, [], reference.toString()) as any;
    }
  }

  return { command: "error", data: { message: "No valid solution for this variant." } };
}

function parseConstraints(json: any): VariantConstraints {
  const c = emptyConstraints();
  if (json.palindromeLines) c.palindromeLines = json.palindromeLines;
  if (json.thermos) c.thermos = json.thermos;
  if (json.renbanLines) c.renbanLines = json.renbanLines;
  if (json.arrows) {
    c.arrows = json.arrows.map((a: any) => ({ circle: a.circle, path: a.path }));
  }
  if (json.kropkiDots) {
    c.kropkiDots = json.kropkiDots.map((k: any) => ({
      a: k.a, b: k.b,
      kind: k.kind === "black" ? 1 : 0,
    }));
  }
  if (json.xvPairs) {
    c.xvPairs = json.xvPairs.map((x: any) => ({
      a: x.a, b: x.b,
      kind: x.kind === "x" ? 1 : 0,
    }));
  }
  if (json.greaterThan) c.greaterThan = json.greaterThan;
  return c;
}
