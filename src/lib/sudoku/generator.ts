import { DlxSolver } from "./dlx";
import * as dlx from "./dlx";
import * as backtrack from "./backtrack";
import { Grid, rcIdx, digitToBit, type CellIdx, type Digit } from "./types";
import { VariantType, variantName } from "./variants";
import { VariantConstraints, emptyConstraints, KropkiKind, XVKind } from "./backtrack";

function splitmix64(seed: number): number {
  let z = seed >>> 0;
  z = Math.imul(z ^ (z >>> 30), 0xbf58476d);
  z = Math.imul(z ^ (z >>> 27), 0x94d049bb);
  return (z ^ (z >>> 31)) >>> 0;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function randomRange(seed: () => number, lo: number, hi: number): number {
  return lo + (seed() % (hi - lo + 1));
}

export function createSeededRandom(seed?: number): () => number {
  let state = seed !== undefined ? seed >>> 0 : (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
  return () => {
    state = splitmix64(state);
    return state;
  };
}

function shuffle<T>(rng: () => number, arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
  Expert = "expert",
}

export interface GeneratedPuzzle {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  numClues: number;
  variant: VariantType;
  constraints: VariantConstraints | null;
}

const BASE_GRID_STR = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

function buildBaseGrid(): Grid {
  return Grid.fromString(BASE_GRID_STR);
}

function permuteDigits(grid: Grid, perm: number[]): Grid {
  const result = new Grid();
  for (let cell = 0; cell < 81; cell++) {
    const v = grid.value(cell);
    if (v !== null) {
      result.cells[cell] = digitToBit(perm[v - 1]);
    }
  }
  return result;
}

function swapBands(grid: Grid, bandA: number, bandB: number): Grid {
  const result = grid.clone();
  for (let i = 0; i < 3; i++) {
    const rowA = bandA * 3 + i;
    const rowB = bandB * 3 + i;
    for (let c = 0; c < 9; c++) {
      result.cells[rowA * 9 + c] = grid.cells[rowB * 9 + c];
      result.cells[rowB * 9 + c] = grid.cells[rowA * 9 + c];
    }
  }
  return result;
}

function swapStacks(grid: Grid, stackA: number, stackB: number): Grid {
  const result = grid.clone();
  for (let i = 0; i < 3; i++) {
    const colA = stackA * 3 + i;
    const colB = stackB * 3 + i;
    for (let r = 0; r < 9; r++) {
      result.cells[r * 9 + colA] = grid.cells[r * 9 + colB];
      result.cells[r * 9 + colB] = grid.cells[r * 9 + colA];
    }
  }
  return result;
}

function swapRowsInBand(grid: Grid, band: number, rowA: number, rowB: number): Grid {
  const result = grid.clone();
  const r1 = band * 3 + rowA;
  const r2 = band * 3 + rowB;
  for (let c = 0; c < 9; c++) {
    result.cells[r1 * 9 + c] = grid.cells[r2 * 9 + c];
    result.cells[r2 * 9 + c] = grid.cells[r1 * 9 + c];
  }
  return result;
}

function swapColsInStack(grid: Grid, stack: number, colA: number, colB: number): Grid {
  const result = grid.clone();
  const c1 = stack * 3 + colA;
  const c2 = stack * 3 + colB;
  for (let r = 0; r < 9; r++) {
    result.cells[r * 9 + c1] = grid.cells[r * 9 + c2];
    result.cells[r * 9 + c2] = grid.cells[r * 9 + c1];
  }
  return result;
}

function generateRandomSolution(rng: () => number): Grid {
  const base = buildBaseGrid();
  let grid = base;

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffle(rng, digits);
  grid = permuteDigits(grid, digits);

  for (let i = 0; i < (rng() % 4); i++) {
    grid = swapBands(grid, rng() % 3, rng() % 3);
  }
  for (let i = 0; i < (rng() % 4); i++) {
    grid = swapStacks(grid, rng() % 3, rng() % 3);
  }
  for (let b = 0; b < 3; b++) {
    for (let i = 0; i < (rng() % 3); i++) {
      grid = swapRowsInBand(grid, b, rng() % 3, rng() % 3);
    }
  }
  for (let s = 0; s < 3; s++) {
    for (let i = 0; i < (rng() % 3); i++) {
      grid = swapColsInStack(grid, s, rng() % 3, rng() % 3);
    }
  }

  return grid;
}

function buildFromGivens(solution: Grid, givens: boolean[]): Grid {
  const chars: string[] = new Array(81).fill(".");
  for (let i = 0; i < 81; i++) {
    if (givens[i]) {
      const d = solution.value(i);
      if (d !== null) chars[i] = String(d);
    }
  }
  return Grid.fromString(chars.join(""));
}

function hasFullBox(givens: boolean[]): boolean {
  for (let boxIdx = 0; boxIdx < 9; boxIdx++) {
    const startRow = Math.floor(boxIdx / 3) * 3;
    const startCol = (boxIdx % 3) * 3;
    let count = 0;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (givens[r * 9 + c]) count++;
      }
    }
    if (count === 9) return true;
  }
  return false;
}

function clueRange(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case Difficulty.Easy: return [36, 45];
    case Difficulty.Medium: return [30, 35];
    case Difficulty.Hard: return [26, 29];
    case Difficulty.Expert: return [22, 25];
  }
}

export function generatePuzzle(difficulty: Difficulty, seed?: number): GeneratedPuzzle {
  const rng = createSeededRandom(seed);
  const [minClues, maxClues] = clueRange(difficulty);

  for (let attempt = 0; attempt < 50; attempt++) {
    const solution = generateRandomSolution(rng);
    const target = minClues + (rng() % (maxClues - minClues + 1));
    const givens = new Array(81).fill(true);
    const cells = Array.from({ length: 81 }, (_, i) => i);
    shuffle(rng, cells);

    for (const cell of cells) {
      if (givens.filter(Boolean).length <= target) break;
      givens[cell] = false;
      const puzzle = buildFromGivens(solution, givens);
      const solver = new DlxSolver(0);
      const sols = solver.solve(puzzle);
      if (sols.length !== 1) {
        givens[cell] = true;
      }
    }

    const puzzle = buildFromGivens(solution, givens);
    const numClues = givens.filter(Boolean).length;

    if (!hasFullBox(givens) && numClues >= 17) {
      try {
        dlx.validateAndSolve(puzzle);
        return { puzzle, solution, difficulty, numClues, variant: VariantType.Classic, constraints: null };
      } catch { continue; }
    }
  }
  throw new Error("Failed to generate a valid puzzle after 50 attempts.");
}

function generateRegionVariantSolution(rng: () => number, solveFn: (p: Grid) => Grid): Grid | null {
  for (let attempt = 0; attempt < 20; attempt++) {
    const puzzle = new Grid();
    const numSeed = 2 + (rng() % 3);
    const cells = Array.from({ length: 81 }, (_, i) => i);
    shuffle(rng, cells);
    let placed = 0;
    for (const c of cells) {
      if (placed >= numSeed) break;
      const row = Math.floor(c / 9);
      const col = c % 9;
      const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      shuffle(rng, digits);
      for (const d of digits) {
        const mask = 1 << (d - 1);
        let ok = true;
        for (let o = 0; o < placed; o++) {
          const oc = cells[o];
          const ov = puzzle.cells[oc];
          if (ov === mask) {
            const or = Math.floor(oc / 9);
            const ocur = oc % 9;
            if (or === row || ocur === col || (Math.floor(or / 3) * 3 + Math.floor(ocur / 3)) === (Math.floor(row / 3) * 3 + Math.floor(col / 3))) {
              ok = false; break;
            }
          }
        }
        if (ok) { puzzle.cells[c] = mask; placed++; break; }
      }
    }
    if (placed < 2) continue;
    try {
      return solveFn(puzzle);
    } catch { continue; }
  }
  return null;
}

function allAdjacentPairs(): [number, number][] {
  const pairs: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 8; c++) pairs.push([rcIdx(r, c), rcIdx(r, c + 1)]);
  }
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 9; c++) pairs.push([rcIdx(r, c), rcIdx(r + 1, c)]);
  }
  return pairs;
}

function findPalindromePaths(rng: () => number, solution: Grid): number[][] {
  const lines: number[][] = [];
  const used = new Array(81).fill(false);

  for (let a = 0; a < 81; a++) {
    if (used[a]) continue;
    const da = solution.value(a);
    if (da === null) continue;
    const ar = Math.floor(a / 9);
    const ac = a % 9;
    for (const [dr1, dc1] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
      const br = ar + dr1;
      const bc = ac + dc1;
      if (br < 0 || br >= 9 || bc < 0 || bc >= 9) continue;
      const b = rcIdx(br, bc);
      if (used[b]) continue;
      const db = solution.value(b);
      if (db === null) continue;
      for (const [dr2, dc2] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
        const cr = br + dr2;
        const cc = bc + dc2;
        if (cr < 0 || cr >= 9 || cc < 0 || cc >= 9) continue;
        const c = rcIdx(cr, cc);
        if (used[c] || c === a || c === b) continue;
        for (const [dr3, dc3] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
          const dr = cr + dr3;
          const dc = cc + dc3;
          if (dr < 0 || dr >= 9 || dc < 0 || dc >= 9) continue;
          const d = rcIdx(dr, dc);
          if (used[d] || d === a || d === b || d === c) continue;
          const dd = solution.value(d);
          if (dd === null || dd !== db) continue;
          for (const [dr4, dc4] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
            const er = dr + dr4;
            const ec = dc + dc4;
            if (er < 0 || er >= 9 || ec < 0 || ec >= 9) continue;
            const e = rcIdx(er, ec);
            if (used[e] || e === a || e === b || e === c || e === d) continue;
            if (solution.value(e) !== da) continue;
            const path = [a, b, c, d, e];
            for (const cell of path) used[cell] = true;
            lines.push(path);
            if (lines.length >= 3) return lines;
          }
        }
      }
    }
  }
  return lines;
}

function findThermoPaths(rng: () => number, solution: Grid): number[][] {
  const used = new Array(81).fill(false);
  const thermos: number[][] = [];
  for (let _ = 0; _ < 4; _++) {
    let cells = Array.from({ length: 81 }, (_, i) => i).filter(i => !used[i]);
    if (cells.length === 0) break;
    cells.sort((a, b) => (solution.value(a) || 0) - (solution.value(b) || 0));
    shuffle(rng, cells);

    const start = cells[0];
    const thermo = [start];
    used[start] = true;
    let tipD = solution.value(start)!;

    while (true) {
      const tip = thermo[thermo.length - 1];
      const tr = Math.floor(tip / 9);
      const tc = tip % 9;
      const candidates: number[] = [];
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
        const nr = tr + dr;
        const nc = tc + dc;
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
          const n = rcIdx(nr, nc);
          if (!used[n]) {
            const d = solution.value(n);
            if (d !== null && d > tipD) candidates.push(n);
          }
        }
      }
      if (candidates.length === 0) break;
      shuffle(rng, candidates);
      candidates.sort((a, b) => (solution.value(a) || 0) - (solution.value(b) || 0));
      const next = candidates[0];
      tipD = solution.value(next)!;
      thermo.push(next);
      used[next] = true;
      if (thermo.length >= 5) break;
    }

    if (thermo.length >= 3) {
      thermos.push(thermo);
    } else {
      for (const c of thermo) used[c] = false;
    }
  }
  return thermos;
}

function findRenbanPaths(rng: () => number, solution: Grid): number[][] {
  const used = new Array(81).fill(false);
  const lines: number[][] = [];
  for (let _ = 0; _ < 4; _++) {
    let cells = Array.from({ length: 81 }, (_, i) => i).filter(i => !used[i]);
    if (cells.length < 3) break;
    cells.sort((a, b) => (solution.value(a) || 0) - (solution.value(b) || 0));
    shuffle(rng, cells);

    const line: number[] = [];
    const start = cells[0];
    line.push(start);
    used[start] = true;
    const startD = solution.value(start)!;

    for (let target = (startD > 1 ? startD - 1 : 1); target <= 9; target++) {
      if (line.length >= 5) break;
      if (target === startD) continue;
      const tip = line[line.length - 1];
      const tipR = Math.floor(tip / 9);
      const tipC = tip % 9;
      let found = false;
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
        if (found) break;
        const nr = tipR + dr;
        const nc = tipC + dc;
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
          const n = rcIdx(nr, nc);
          if (!used[n] && solution.value(n) === target) {
            line.push(n); used[n] = true; found = true;
          }
        }
      }
      if (!found && line.length >= 3) {
        const front = line[0];
        const frontR = Math.floor(front / 9);
        const frontC = front % 9;
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
          if (found) break;
          const nr = frontR + dr;
          const nc = frontC + dc;
          if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
            const n = rcIdx(nr, nc);
            if (!used[n] && solution.value(n) === target) {
              line.unshift(n); used[n] = true; found = true;
            }
          }
        }
      }
    }
    if (line.length >= 3) lines.push(line);
    else for (const c of line) used[c] = false;
  }
  return lines;
}

function findArrowPaths(rng: () => number, solution: Grid): { circle: number; path: number[] }[] {
  const used = new Array(81).fill(false);
  const arrows: { circle: number; path: number[] }[] = [];

  for (let _ = 0; _ < 3; _++) {
    let circles = Array.from({ length: 81 }, (_, i) => i).filter(i => !used[i]);
    if (circles.length === 0) break;
    circles.sort((a, b) => (solution.value(b) || 0) - (solution.value(a) || 0));
    shuffle(rng, circles);

    let found = false;
    for (const circle of circles) {
      if (used[circle]) continue;
      const cv = solution.value(circle)!;
      const cr = Math.floor(circle / 9);
      const cc = circle % 9;
      const neighbors: number[] = [];
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
          const n = rcIdx(nr, nc);
          if (!used[n] && (solution.value(n) || 0) < cv) neighbors.push(n);
        }
      }
      shuffle(rng, neighbors);
      neighbors.sort((a, b) => (solution.value(a) || 0) - (solution.value(b) || 0));

      for (const start of neighbors) {
        if (used[start]) continue;
        const arrow = [start];
        let sum = solution.value(start)!;
        let current = start;
        for (let i = 0; i < 6; i++) {
          if (sum === cv) { found = true; break; }
          if (sum > cv) break;
          const curR = Math.floor(current / 9);
          const curC = current % 9;
          const nxt: number[] = [];
          for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
              const n = rcIdx(nr, nc);
              if (n !== circle && !used[n] && !arrow.includes(n)) {
                const nv = solution.value(n);
                if (nv !== null && sum + nv <= cv) nxt.push(n);
              }
            }
          }
          if (nxt.length === 0) break;
          shuffle(rng, nxt);
          nxt.sort((a, b) => (solution.value(a) || 0) - (solution.value(b) || 0));
          const pick = nxt[nxt.length - 1];
          sum += solution.value(pick)!;
          arrow.push(pick);
          current = pick;
        }
        if (found && sum === cv) {
          for (const c of arrow) used[c] = true;
          used[circle] = true;
          arrows.push({ circle, path: arrow });
          break;
        }
      }
      if (found) break;
    }
  }
  return arrows;
}

function findKropkiPairs(_rng: () => number, solution: Grid): { a: number; b: number; kind: KropkiKind }[] {
  const pairs = allAdjacentPairs();
  const dots: { a: number; b: number; kind: KropkiKind }[] = [];
  for (const [a, b] of pairs) {
    if (dots.length >= 8) break;
    const da = solution.value(a);
    const db = solution.value(b);
    if (da !== null && db !== null) {
      const diff = da > db ? da - db : db - da;
      if (diff === 1) dots.push({ a, b, kind: KropkiKind.White });
      else if (da === db * 2 || db === da * 2) dots.push({ a, b, kind: KropkiKind.Black });
    }
  }
  return dots;
}

function findXVPairs(_rng: () => number, solution: Grid): { a: number; b: number; kind: XVKind }[] {
  const pairs = allAdjacentPairs();
  const xv: { a: number; b: number; kind: XVKind }[] = [];
  for (const [a, b] of pairs) {
    if (xv.length >= 6) break;
    const da = solution.value(a);
    const db = solution.value(b);
    if (da !== null && db !== null) {
      if (da + db === 5) xv.push({ a, b, kind: XVKind.V });
      else if (da + db === 10) xv.push({ a, b, kind: XVKind.X });
    }
  }
  return xv;
}

function findGreaterThanPairs(_rng: () => number, solution: Grid): number[][] {
  const pairs = allAdjacentPairs();
  const gt: number[][] = [];
  for (const [a, b] of pairs) {
    if (gt.length >= 12) break;
    const da = solution.value(a);
    const db = solution.value(b);
    if (da !== null && db !== null && da !== db) {
      gt.push(da > db ? [a, b] : [b, a]);
    }
  }
  return gt;
}

function generateVariantMarkings(variant: VariantType, rng: () => number, solution: Grid): VariantConstraints {
  const c = emptyConstraints();
  switch (variant) {
    case VariantType.Palindrome: c.palindromeLines = findPalindromePaths(rng, solution); break;
    case VariantType.Thermo: c.thermos = findThermoPaths(rng, solution); break;
    case VariantType.Renban: c.renbanLines = findRenbanPaths(rng, solution); break;
    case VariantType.Arrow: c.arrows = findArrowPaths(rng, solution); break;
    case VariantType.Kropki: c.kropkiDots = findKropkiPairs(rng, solution); break;
    case VariantType.XV: c.xvPairs = findXVPairs(rng, solution); break;
    case VariantType.GreaterThan: c.greaterThan = findGreaterThanPairs(rng, solution); break;
  }
  return c;
}

function hasVariantConstraints(c: VariantConstraints, variant: VariantType): boolean {
  switch (variant) {
    case VariantType.Palindrome: return c.palindromeLines.length > 0;
    case VariantType.Thermo: return c.thermos.length > 0;
    case VariantType.Renban: return c.renbanLines.length > 0;
    case VariantType.Arrow: return c.arrows.length > 0;
    case VariantType.Kropki: return c.kropkiDots.length > 0;
    case VariantType.XV: return c.xvPairs.length > 0;
    case VariantType.GreaterThan: return c.greaterThan.length > 0;
    default: return true;
  }
}

function generateRegionVariantPuzzle(
  difficulty: Difficulty,
  variant: VariantType,
  solveFn: (p: Grid) => Grid,
  validateFn: (p: Grid) => Grid,
  seed?: number,
): GeneratedPuzzle {
  const rng = createSeededRandom(seed);
  const [minClues] = clueRange(difficulty);

  for (let attempt = 0; attempt < 100; attempt++) {
    const sol = generateRegionVariantSolution(rng, solveFn);
    if (!sol) continue;
    const target = minClues;
    const givens = new Array(81).fill(true);
    const cells = Array.from({ length: 81 }, (_, i) => i);
    shuffle(rng, cells);

    for (const cell of cells) {
      if (givens.filter(Boolean).length <= target) break;
      givens[cell] = false;
      const puzzle = buildFromGivens(sol, givens);
      const solver = new DlxSolver(0);
      const sols = solver.solve(puzzle);
      if (sols.length !== 1) givens[cell] = true;
    }

    const puzzle = buildFromGivens(sol, givens);
    const numClues = givens.filter(Boolean).length;

    if (!hasFullBox(givens) && numClues >= 17) {
      try {
        validateFn(puzzle);
        return { puzzle, solution: sol, difficulty, numClues, variant, constraints: null };
      } catch { continue; }
    }
  }
  throw new Error(`Failed to generate ${variant} puzzle after 100 attempts.`);
}

export function generateBacktrackVariantPuzzle(difficulty: Difficulty, variant: VariantType, seed?: number): GeneratedPuzzle {
  const rng = createSeededRandom(seed);
  const [minClues] = clueRange(difficulty);

  for (let attempt = 0; attempt < 100; attempt++) {
    const solution = generateRandomSolution(rng);
    const constraints = generateVariantMarkings(variant, rng, solution);
    if (!hasVariantConstraints(constraints, variant)) continue;

    const target = minClues;
    const givens = new Array(81).fill(true);
    const cells = Array.from({ length: 81 }, (_, i) => i);
    shuffle(rng, cells);

    for (const cell of cells) {
      if (givens.filter(Boolean).length <= target) break;
      givens[cell] = false;
      const puzzle = buildFromGivens(solution, givens);
      const sols = backtrack.solveVariant(puzzle, constraints, 2);
      if (sols.length !== 1) givens[cell] = true;
    }

    const puzzle = buildFromGivens(solution, givens);
    const numClues = givens.filter(Boolean).length;

    if (!hasFullBox(givens) && numClues >= 17) {
      return { puzzle, solution, difficulty, numClues, variant, constraints };
    }
  }
  throw new Error(`Failed to generate ${variant} puzzle after 100 attempts.`);
}

export function generateVariantPuzzle(difficulty: Difficulty, variant: VariantType, seed?: number): GeneratedPuzzle {
  switch (variant) {
    case VariantType.Classic: return generatePuzzle(difficulty, seed);
    case VariantType.XSudoku: return generateRegionVariantPuzzle(difficulty, variant, dlx.validateAndSolveVariant, dlx.validateAndSolveVariant, seed);
    case VariantType.Hyper: return generateRegionVariantPuzzle(difficulty, variant, dlx.validateAndSolveHyper, dlx.validateAndSolveHyper, seed);
    case VariantType.AntiKnight: return generateRegionVariantPuzzle(difficulty, variant, dlx.validateAndSolveAntiknight, dlx.validateAndSolveAntiknight, seed);
    case VariantType.AntiKing: return generateRegionVariantPuzzle(difficulty, variant, dlx.validateAndSolveAntiking, dlx.validateAndSolveAntiking, seed);
    default: return generateBacktrackVariantPuzzle(difficulty, variant, seed);
  }
}

export function verifySolutionGrids(puzzle: Grid, userSolution: Grid): string {
  if (!userSolution.isSolved()) {
    const hasZeros = userSolution.cells.some(m => m === 0);
    if (hasZeros) {
      throw new Error("The provided solution contains conflicts (a cell has no possible digits). Check for duplicate digits in rows, columns, or boxes.");
    }
    throw new Error("The provided solution is not complete (some cells are unsolved).");
  }

  const expected = dlx.validateAndSolve(puzzle);

  if (userSolution.toString() === expected.toString()) {
    return "✓ Correct! Your solution matches the verified answer.";
  }

  const differences: string[] = [];
  for (let i = 0; i < 81; i++) {
    const uv = userSolution.value(i);
    const ev = expected.value(i);
    if (uv !== ev) {
      const uc = uv !== null ? String(uv) : ".";
      const ec = ev !== null ? String(ev) : ".";
      const r = Math.floor(i / 9) + 1;
      const c = (i % 9) + 1;
      differences.push(`  R${r}C${c}: you placed ${uc}, expected ${ec}`);
    }
  }
  throw new Error(`✗ Incorrect solution. ${differences.length} cell(s) differ:\n${differences.join("\n")}`);
}
