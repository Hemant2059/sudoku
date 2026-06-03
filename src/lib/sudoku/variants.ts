import { Grid, cellRow, cellCol, rcIdx, type CellIdx, type Digit } from "./types";

export enum VariantType {
  Classic = "classic",
  XSudoku = "xsudoku",
  Hyper = "hyper",
  AntiKnight = "antiknight",
  AntiKing = "antiking",
  Thermo = "thermo",
  Arrow = "arrow",
  Palindrome = "palindrome",
  Renban = "renban",
  Kropki = "kropki",
  XV = "xv",
  GreaterThan = "greaterthan",
}

export function variantName(v: VariantType): string {
  return v as string;
}

export const HYPER_WINDOWS: number[][] = [
  [10, 11, 12, 19, 20, 21, 28, 29, 30],
  [14, 15, 16, 23, 24, 25, 32, 33, 34],
  [46, 47, 48, 55, 56, 57, 64, 65, 66],
  [50, 51, 52, 59, 60, 61, 68, 69, 70],
];

export const KNIGHT_MOVES: [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export const KING_MOVES: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

export function is_valid_xsudoku_solution(grid: Grid): boolean {
  const mainDiag = new Array(10).fill(false);
  const antiDiag = new Array(10).fill(false);
  for (let i = 0; i < 9; i++) {
    const d1 = grid.value(rcIdx(i, i));
    if (d1 !== null) {
      if (mainDiag[d1]) return false;
      mainDiag[d1] = true;
    }
    const d2 = grid.value(rcIdx(i, 8 - i));
    if (d2 !== null) {
      if (antiDiag[d2]) return false;
      antiDiag[d2] = true;
    }
  }
  return mainDiag.slice(1).every(Boolean) && antiDiag.slice(1).every(Boolean);
}

export function is_valid_hyper_solution(grid: Grid): boolean {
  for (const window of HYPER_WINDOWS) {
    const seen = new Array(10).fill(false);
    for (const c of window) {
      const d = grid.value(c);
      if (d !== null) {
        if (seen[d]) return false;
        seen[d] = true;
      }
    }
    if (!seen.slice(1).every(Boolean)) return false;
  }
  return true;
}

export function is_valid_antiknight_solution(grid: Grid): boolean {
  for (let cell = 0; cell < 81; cell++) {
    const v = grid.value(cell);
    if (v === null) continue;
    const r = cellRow(cell);
    const c = cellCol(cell);
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
        const p = rcIdx(nr, nc);
        if (grid.value(p) === v) return false;
      }
    }
  }
  return true;
}

export function is_valid_antiking_solution(grid: Grid): boolean {
  for (let cell = 0; cell < 81; cell++) {
    const v = grid.value(cell);
    if (v === null) continue;
    const r = cellRow(cell);
    const c = cellCol(cell);
    for (const [dr, dc] of KING_MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
        const p = rcIdx(nr, nc);
        if (grid.value(p) === v) return false;
      }
    }
  }
  return true;
}
