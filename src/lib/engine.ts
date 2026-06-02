import { execFileSync } from "child_process";
import path from "path";
import type { Difficulty, GenerationResponse, SolveResponse, VerifyResponse } from "./types";

function getBinaryPath(): string {
  const envPath = process.env.SODUKO_BIN;
  if (envPath) return path.resolve(process.cwd(), envPath);
  return path.join(process.cwd(), "bin", "soduko");
}

function runBinary(args: string[]): string {
  const binary = getBinaryPath();
  return execFileSync(binary, args, {
    encoding: "utf-8",
    timeout: 30000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

export function generatePuzzle(difficulty: Difficulty): GenerationResponse {
  const raw = runBinary(["--gen", "--difficulty", difficulty, "--json"]);
  return JSON.parse(raw) as GenerationResponse;
}

export function generatePuzzleWithSolution(difficulty: Difficulty): {
  puzzle: string;
  solution: string;
  difficulty: string;
  numClues: number;
} {
  const raw = runBinary(["--gen", "--difficulty", difficulty, "--answer", "--json"]);
  const parsed = JSON.parse(raw) as { command: string; data: { puzzle: string; solution: string; difficulty: string; numClues: number } };
  return parsed.data;
}

export function solvePuzzle(puzzle: string): SolveResponse {
  const raw = runBinary(["--json", puzzle]);
  return JSON.parse(raw) as SolveResponse;
}

export function verifySolution(puzzle: string, solution: string): VerifyResponse {
  const raw = runBinary(["--verify", puzzle, solution, "--json"]);
  return JSON.parse(raw) as VerifyResponse;
}

export function generateKillerPuzzle(): { command: string; data: { puzzle: string; solution: string; cages: { cells: number[]; sum: number }[] } } {
  const raw = runBinary(["--killer-gen"]);
  return JSON.parse(raw);
}

export function gradePuzzle(puzzle: string): { command: string; data: any } {
  const raw = runBinary(["--grade", puzzle]);
  return JSON.parse(raw);
}

export function generateVariantPuzzle(variant: string, difficulty: string): {
  command: string;
  data: { puzzle: string; solution: string; difficulty: string; numClues: number; variant: string; constraints?: any };
} {
  const raw = runBinary(["--variant-gen", variant, difficulty]);
  return JSON.parse(raw);
}
