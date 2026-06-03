import { Grid, cellRow, cellCol, cellBox, rcIdx, digitToBit, bitToDigit, type CellIdx, type Digit, type CandidateMask } from "./types";
import { VariantType, KNIGHT_MOVES, KING_MOVES, HYPER_WINDOWS, is_valid_xsudoku_solution, is_valid_hyper_solution, is_valid_antiknight_solution, is_valid_antiking_solution } from "./variants";

export enum KropkiKind { White, Black }
export enum XVKind { V, X }

export interface VariantConstraints {
  xsudoku: boolean;
  hyper: boolean;
  antiknight: boolean;
  antiking: boolean;
  palindromeLines: number[][];
  thermos: number[][];
  renbanLines: number[][];
  arrows: { circle: number; path: number[] }[];
  kropkiDots: { a: number; b: number; kind: KropkiKind }[];
  xvPairs: { a: number; b: number; kind: XVKind }[];
  greaterThan: number[][];
}

export function emptyConstraints(): VariantConstraints {
  return {
    xsudoku: false, hyper: false, antiknight: false, antiking: false,
    palindromeLines: [], thermos: [], renbanLines: [],
    arrows: [], kropkiDots: [], xvPairs: [], greaterThan: [],
  };
}

function knightPeers(cell: number): number[] {
  const r = cellRow(cell);
  const c = cellCol(cell);
  const peers: number[] = [];
  for (const [dr, dc] of KNIGHT_MOVES) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) peers.push(rcIdx(nr, nc));
  }
  return peers;
}

function kingPeers(cell: number): number[] {
  const r = cellRow(cell);
  const c = cellCol(cell);
  const peers: number[] = [];
  for (const [dr, dc] of KING_MOVES) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) peers.push(rcIdx(nr, nc));
  }
  return peers;
}

function standardConstraints(grid: Grid, cell: number, digit: Digit): boolean {
  const r = cellRow(cell);
  const c = cellCol(cell);
  const b = cellBox(cell);
  for (let i = 0; i < 9; i++) {
    if (i !== c && grid.value(rcIdx(r, i)) === digit) return false;
    if (i !== r && grid.value(rcIdx(i, c)) === digit) return false;
  }
  const br = Math.floor(b / 3) * 3;
  const bc = (b % 3) * 3;
  for (let row = br; row < br + 3; row++) {
    for (let col = bc; col < bc + 3; col++) {
      const peer = rcIdx(row, col);
      if (peer !== cell && grid.value(peer) === digit) return false;
    }
  }
  return true;
}

function partialGridHasConflict(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    const seen = new Array(10).fill(0);
    for (let c = 0; c < 9; c++) {
      const mask = grid.candidates(rcIdx(r, c));
      if (mask !== 0 && (mask & (mask - 1)) === 0) {
        const d = bitToDigit(mask);
        if (d !== null) { if (seen[d] !== 0) return true; seen[d] = 1; }
      }
    }
  }
  for (let c = 0; c < 9; c++) {
    const seen = new Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
      const mask = grid.candidates(rcIdx(r, c));
      if (mask !== 0 && (mask & (mask - 1)) === 0) {
        const d = bitToDigit(mask);
        if (d !== null) { if (seen[d] !== 0) return true; seen[d] = 1; }
      }
    }
  }
  for (let b = 0; b < 9; b++) {
    const seen = new Array(10).fill(0);
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        const mask = grid.candidates(rcIdx(r, c));
        if (mask !== 0 && (mask & (mask - 1)) === 0) {
          const d = bitToDigit(mask);
          if (d !== null) { if (seen[d] !== 0) return true; seen[d] = 1; }
        }
      }
    }
  }
  return false;
}

function fullGridIsValidSudoku(grid: Grid): boolean {
  if (!grid.isSolved()) return false;
  for (let r = 0; r < 9; r++) {
    const seen = new Array(10).fill(false);
    for (let c = 0; c < 9; c++) {
      const d = grid.value(rcIdx(r, c));
      if (d !== null) { if (seen[d]) return false; seen[d] = true; }
    }
  }
  for (let c = 0; c < 9; c++) {
    const seen = new Array(10).fill(false);
    for (let r = 0; r < 9; r++) {
      const d = grid.value(rcIdx(r, c));
      if (d !== null) { if (seen[d]) return false; seen[d] = true; }
    }
  }
  for (let b = 0; b < 9; b++) {
    const seen = new Array(10).fill(false);
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        const d = grid.value(rcIdx(r, c));
        if (d !== null) { if (seen[d]) return false; seen[d] = true; }
      }
    }
  }
  return true;
}

function variantConstraintsSatisfiable(grid: Grid, constraints: VariantConstraints, changedCell: number, changedDigit: Digit): boolean {
  if (constraints.antiknight) {
    for (const p of knightPeers(changedCell)) {
      if (grid.value(p) === changedDigit) return false;
    }
  }
  if (constraints.antiking) {
    for (const p of kingPeers(changedCell)) {
      if (grid.value(p) === changedDigit) return false;
    }
  }
  if (constraints.palindromeLines.length > 0) {
    if (!checkPalindromePartial(grid, constraints)) return false;
  }
  if (constraints.thermos.length > 0) {
    if (!checkThermoPartial(grid, constraints, changedCell, changedDigit)) return false;
  }
  if (constraints.renbanLines.length > 0) {
    if (!checkRenbanPartial(grid, constraints)) return false;
  }
  if (constraints.arrows.length > 0) {
    if (!checkArrowPartial(grid, constraints)) return false;
  }
  if (constraints.kropkiDots.length > 0) {
    if (!checkKropkiPartial(grid, constraints, changedCell)) return false;
  }
  if (constraints.xvPairs.length > 0) {
    if (!checkXVPartial(grid, constraints, changedCell)) return false;
  }
  if (constraints.greaterThan.length > 0) {
    if (!checkGreaterThanPartial(grid, constraints, changedCell)) return false;
  }
  return true;
}

function checkPalindromePartial(grid: Grid, constraints: VariantConstraints): boolean {
  for (const line of constraints.palindromeLines) {
    const len = line.length;
    for (let i = 0; i < Math.floor(len / 2); i++) {
      const a = line[i];
      const b = line[len - 1 - i];
      const va = grid.value(a);
      const vb = grid.value(b);
      if (va !== null && vb !== null && va !== vb) return false;
      if (va !== null && vb === null && !grid.isCandidate(b, va)) return false;
      if (vb !== null && va === null && !grid.isCandidate(a, vb)) return false;
    }
  }
  return true;
}

function checkThermoPartial(grid: Grid, constraints: VariantConstraints, changedCell: number, changedDigit: Digit): boolean {
  for (const thermo of constraints.thermos) {
    const pos = thermo.indexOf(changedCell);
    if (pos === -1) continue;
    for (let j = 0; j < pos; j++) {
      const other = thermo[j];
      const d = grid.value(other);
      if (d !== null && d >= changedDigit) return false;
      if (d === null) {
        const mask = grid.candidates(other);
        if ((mask & ((1 << (changedDigit - 1)) - 1)) === 0) return false;
      }
    }
    for (let j = pos + 1; j < thermo.length; j++) {
      const other = thermo[j];
      const d = grid.value(other);
      if (d !== null && d <= changedDigit) return false;
      if (d === null) {
        const mask = grid.candidates(other);
        if ((mask & (~0 << changedDigit)) === 0) return false;
      }
    }
  }
  return true;
}

function checkRenbanPartial(grid: Grid, constraints: VariantConstraints): boolean {
  for (const line of constraints.renbanLines) {
    const placed: number[] = [];
    for (const c of line) {
      const d = grid.value(c);
      if (d !== null) {
        if (placed.includes(d)) return false;
        placed.push(d);
      }
    }
    if (placed.length >= 2) {
      const min = Math.min(...placed);
      const max = Math.max(...placed);
      if (max - min + 1 > line.length) return false;
      if (max - min + 1 < placed.length) return false;
    }
  }
  return true;
}

function checkArrowPartial(grid: Grid, constraints: VariantConstraints): boolean {
  for (const { circle, path } of constraints.arrows) {
    const circleVal = grid.value(circle);
    if (circleVal === null) continue;
    let sum = 0;
    let allSet = true;
    for (const c of path) {
      const d = grid.value(c);
      if (d !== null) sum += d;
      else allSet = false;
    }
    if (allSet && sum !== circleVal) return false;
    if (!allSet) {
      const missing = path.filter(cc => grid.value(cc) === null).length;
      const curSum = path.reduce((acc, cc) => acc + (grid.value(cc) || 0), 0);
      if (curSum + missing * 9 < circleVal) return false;
      if (curSum + missing * 1 > circleVal) return false;
    }
  }
  return true;
}

function checkKropkiPartial(grid: Grid, constraints: VariantConstraints, changedCell: number): boolean {
  for (const { a, b, kind } of constraints.kropkiDots) {
    if (a !== changedCell && b !== changedCell) continue;
    const va = grid.value(a);
    const vb = grid.value(b);
    if (va !== null && vb !== null) {
      const diff = Math.abs(va - vb);
      if (kind === KropkiKind.White && diff !== 1) return false;
      if (kind === KropkiKind.Black && !(va === vb * 2 || vb === va * 2)) return false;
    }
    if (va !== null && vb === null && kind === KropkiKind.White) {
      if (va > 1 && !grid.isCandidate(b, va - 1) && va < 9 && !grid.isCandidate(b, va + 1)) return false;
    }
    if (va === null && vb !== null && kind === KropkiKind.White) {
      if (vb > 1 && !grid.isCandidate(a, vb - 1) && vb < 9 && !grid.isCandidate(a, vb + 1)) return false;
    }
    if (va !== null && vb === null && kind === KropkiKind.Black) {
      const ok = (va <= 4 && grid.isCandidate(b, va * 2)) || (va % 2 === 0 && grid.isCandidate(b, va / 2));
      if (!ok) return false;
    }
    if (va === null && vb !== null && kind === KropkiKind.Black) {
      const ok = (vb <= 4 && grid.isCandidate(a, vb * 2)) || (vb % 2 === 0 && grid.isCandidate(a, vb / 2));
      if (!ok) return false;
    }
  }
  return true;
}

function checkXVPartial(grid: Grid, constraints: VariantConstraints, changedCell: number): boolean {
  for (const { a, b, kind } of constraints.xvPairs) {
    if (a !== changedCell && b !== changedCell) continue;
    const va = grid.value(a);
    const vb = grid.value(b);
    if (va !== null && vb !== null) {
      const ok = kind === XVKind.V ? va + vb === 5 : va + vb === 10;
      if (!ok) return false;
    }
    if (va !== null && vb === null) {
      const needed = kind === XVKind.V ? (va < 5 ? 5 - va : 0) : (va < 10 ? 10 - va : 0);
      if (needed < 1 || needed > 9 || !grid.isCandidate(b, needed)) return false;
    }
    if (va === null && vb !== null) {
      const needed = kind === XVKind.V ? (vb < 5 ? 5 - vb : 0) : (vb < 10 ? 10 - vb : 0);
      if (needed < 1 || needed > 9 || !grid.isCandidate(a, needed)) return false;
    }
  }
  return true;
}

function checkGreaterThanPartial(grid: Grid, constraints: VariantConstraints, changedCell: number): boolean {
  for (const [greater, lesser] of constraints.greaterThan) {
    if (greater !== changedCell && lesser !== changedCell) continue;
    const vg = grid.value(greater);
    const vl = grid.value(lesser);
    if (vg !== null && vl !== null) { if (vg <= vl) return false; }
    if (vg !== null && vl === null) {
      if (vg <= 1) return false;
      let anyCandidate = false;
      for (let d = 1; d < vg; d++) { if (grid.isCandidate(lesser, d)) { anyCandidate = true; break; } }
      if (!anyCandidate) return false;
    }
    if (vg === null && vl !== null) {
      if (vl >= 9) return false;
      let anyCandidate = false;
      for (let d = vl + 1; d <= 9; d++) { if (grid.isCandidate(greater, d)) { anyCandidate = true; break; } }
      if (!anyCandidate) return false;
    }
  }
  return true;
}

export function checkSolution(grid: Grid, constraints: VariantConstraints): boolean {
  if (!fullGridIsValidSudoku(grid)) return false;
  if (constraints.xsudoku && !is_valid_xsudoku_solution(grid)) return false;
  if (constraints.hyper && !is_valid_hyper_solution(grid)) return false;
  if (constraints.antiknight && !is_valid_antiknight_solution(grid)) return false;
  if (constraints.antiking && !is_valid_antiking_solution(grid)) return false;
  for (const line of constraints.palindromeLines) {
    const len = line.length;
    for (let i = 0; i < Math.floor(len / 2); i++) {
      if (grid.value(line[i]) !== grid.value(line[len - 1 - i])) return false;
    }
  }
  for (const thermo of constraints.thermos) {
    for (let i = 1; i < thermo.length; i++) {
      const dp = grid.value(thermo[i - 1]);
      const dc = grid.value(thermo[i]);
      if (dp === null || dc === null || dp >= dc) return false;
    }
  }
  for (const line of constraints.renbanLines) {
    const vals: number[] = [];
    for (const c of line) {
      const d = grid.value(c);
      if (d === null) return false;
      vals.push(d);
    }
    vals.sort((a, b) => a - b);
    for (let i = 1; i < vals.length; i++) {
      if (vals[i] !== vals[i - 1] + 1) return false;
    }
  }
  for (const { circle, path } of constraints.arrows) {
    const cv = grid.value(circle);
    if (cv === null) return false;
    const sum = path.reduce((acc, c) => acc + (grid.value(c) || 0), 0);
    if (sum !== cv) return false;
  }
  for (const { a, b, kind } of constraints.kropkiDots) {
    const da = grid.value(a);
    const db = grid.value(b);
    if (da === null || db === null) return false;
    if (kind === KropkiKind.White && Math.abs(da - db) !== 1) return false;
    if (kind === KropkiKind.Black && !(da === db * 2 || db === da * 2)) return false;
  }
  for (const { a, b, kind } of constraints.xvPairs) {
    const da = grid.value(a);
    const db = grid.value(b);
    if (da === null || db === null) return false;
    if (kind === XVKind.V && da + db !== 5) return false;
    if (kind === XVKind.X && da + db !== 10) return false;
  }
  for (const [greater, lesser] of constraints.greaterThan) {
    const vg = grid.value(greater);
    const vl = grid.value(lesser);
    if (vg === null || vl === null || vg <= vl) return false;
  }
  return true;
}

function findBestCell(grid: Grid): { cell: number; digits: number[] } | null {
  let bestCell: number | null = null;
  let bestCount = 10;
  for (let cell = 0; cell < 81; cell++) {
    const mask = grid.candidates(cell);
    if (mask === 0) return null;
    if ((mask & (mask - 1)) === 0) continue;
    const count = popcount(mask);
    if (count < bestCount) {
      bestCount = count;
      bestCell = cell;
      if (count === 1) break;
    }
  }
  if (bestCell === null) return null;
  const mask = grid.candidates(bestCell);
  const digits: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (mask & (1 << (d - 1))) digits.push(d);
  }
  return { cell: bestCell, digits };
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0F0F0F0F;
  return (x * 0x01010101) >>> 24;
}

function backtrack(grid: Grid, constraints: VariantConstraints, maxSolutions: number, solutions: Grid[]): void {
  if (solutions.length >= maxSolutions) return;
  if (grid.cells.some(m => m === 0)) return;
  if (partialGridHasConflict(grid)) return;

  if (grid.isSolved()) {
    if (checkSolution(grid, constraints)) {
      solutions.push(grid.clone());
    }
    return;
  }

  const best = findBestCell(grid);
  if (!best) return;

  for (const digit of best.digits) {
    if (!standardConstraints(grid, best.cell, digit)) continue;
    if (!variantConstraintsSatisfiable(grid, constraints, best.cell, digit)) continue;

    const next = grid.clone();
    next.setValue(best.cell, digit);
    backtrack(next, constraints, maxSolutions, solutions);
    if (solutions.length >= maxSolutions) return;
  }
}

export function solveVariant(grid: Grid, constraints: VariantConstraints, maxSolutions: number): Grid[] {
  const solutions: Grid[] = [];
  backtrack(grid, constraints, maxSolutions, solutions);
  return solutions;
}
