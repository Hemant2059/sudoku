export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface GeneratedPuzzle {
  puzzle: number[];
  solution: number[];
  difficulty: string;
  variant: string;
  givens: number;
  is_killer: boolean;
  killer_cages?: Cage[];
  constraints?: VariantConstraints;
}

export interface SolveStepMutation {
  cell: string;
  action: "SET_VALUE" | "REMOVE_PENCIL_MARK";
  digit: number;
}

export interface SolveStep {
  stepNumber: number;
  strategyName: string;
  isFallbackUsed: boolean;
  description: string;
  mutations: SolveStepMutation[];
  proofChain: { cell: string; digit: number; state: string }[];
  uiHighlights?: HintHighlights;
}

export interface SolveResult {
  puzzle: string;
  valid: boolean;
  solvedGrid: string;
  totalSteps: number;
  steps: SolveStep[];
}

export interface VerifyResult {
  puzzle: string;
  valid: boolean;
  userSolution: string;
  expectedSolution: string | null;
  message: string;
  differences: string[];
}

export interface ApiError {
  command: "error";
  data: { message: string };
}

export interface ApiResponse<T> {
  command: string;
  data: T;
}

export interface GenerationResponse extends ApiResponse<GeneratedPuzzle> {
  command: "generate";
}

export interface SolveResponse extends ApiResponse<SolveResult> {
  command: "solve";
}

export interface VerifyResponse extends ApiResponse<VerifyResult> {
  command: "verify";
}

export type GameStatus = "idle" | "playing" | "checking" | "solved" | "error";

export type CellValue = number | null;

export interface CellState {
  value: CellValue;
  given: boolean;
  candidates: Set<number>;
  centerMarks: Set<number>;
  conflict: boolean;
  highlighted: boolean;
  colors: string[];
}

export type InputMode = "VALUE" | "PENCIL" | "CENTER";

export interface GridSnapshot {
  cells: CellState[];
}

export interface HintHighlights {
  greenCells: number[];
  redCells: number[];
  eliminationCandidates: { cellIndex: number; digit: number }[];
  unitCells: number[];
}

export interface GraderReport {
  assignedDifficulty: string;
  peakStrategyUsed: string;
  totalStepsRequired: number;
  strategyDistribution: Record<string, number>;
  completeSolutionPath: SolveStep[];
}

export interface Cage {
  cells: number[];
  sum: number;
}

export interface Arrow {
  circle: number;
  path: number[];
}

export interface KropkiDot {
  a: number;
  b: number;
  kind: "white" | "black";
}

export interface XVPair {
  a: number;
  b: number;
  kind: "v" | "x";
}

export interface VariantConstraints {
  palindromeLines?: number[][];
  thermos?: number[][];
  renbanLines?: number[][];
  arrows?: Arrow[];
  kropkiDots?: KropkiDot[];
  xvPairs?: XVPair[];
  greaterThan?: number[][];
}

export interface HintStep {
  stepNumber: number;
  strategyName: string;
  isFallbackUsed: boolean;
  description: string;
  mutations: SolveStepMutation[];
  proofChain: { cell: string; digit: number; state: string }[];
  uiHighlights: HintHighlights;
}
