import { Grid, rcIdx, type CellIdx, type Digit, type CandidateMask } from "./types";
import { HYPER_WINDOWS } from "./variants";

const BASE_COL_COUNT = 324;
const XSUDOKU_EXTRA_COLS = 18;
const HYPER_EXTRA_COLS = 36;

const KNIGHT_MOVES: [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const KING_MOVES: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function computeEdges(moves: [number, number][]): [number, number][] {
  const edges: [number, number][] = [];
  for (let a = 0; a < 81; a++) {
    const ar = Math.floor(a / 9);
    const ac = a % 9;
    for (const [dr, dc] of moves) {
      const br = ar + dr;
      const bc = ac + dc;
      if (br >= 0 && br < 9 && bc >= 0 && bc < 9) {
        const b = br * 9 + bc;
        if (a < b) edges.push([a, b]);
      }
    }
  }
  return edges;
}

function edgeColCount(edges: [number, number][]): number {
  return edges.length * 9;
}

function regionColCount(flags: number): number {
  let n = 0;
  if (flags & 1) n += XSUDOKU_EXTRA_COLS;
  if (flags & 2) n += HYPER_EXTRA_COLS;
  return n;
}

function edgesForFlags(flags: number): [number, number][] {
  const combined: [number, number][] = [];
  if (flags & 4) combined.push(...computeEdges(KNIGHT_MOVES));
  if (flags & 8) combined.push(...computeEdges(KING_MOVES));
  combined.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const dedup: [number, number][] = [];
  for (let i = 0; i < combined.length; i++) {
    if (i === 0 || combined[i][0] !== combined[i-1][0] || combined[i][1] !== combined[i-1][1]) {
      dedup.push(combined[i]);
    }
  }
  return dedup;
}

function colCountForFlags(flags: number): number {
  return BASE_COL_COUNT + regionColCount(flags) + edgeColCount(edgesForFlags(flags));
}

export class DlxSolver {
  private l: number[] = [];
  private r: number[] = [];
  private u: number[] = [];
  private d: number[] = [];
  private col: number[] = [];
  private row: number[] = [];
  private size: number[] = [];
  private head = 0;
  private nodeCount = 0;
  private solution: number[] = [];
  private solutions: number[][] = [];
  private maxSolutions = 2;
  private extraFlags = 0;

  constructor(extraFlags = 0) {
    this.extraFlags = extraFlags;
  }

  private colCount(): number {
    return colCountForFlags(this.extraFlags);
  }

  private addNode(left: number, right: number, up: number, down: number, column: number, rowId: number): number {
    const idx = this.nodeCount;
    this.l.push(left);
    this.r.push(right);
    this.u.push(up);
    this.d.push(down);
    this.col.push(column);
    this.row.push(rowId);
    this.nodeCount++;
    return idx;
  }

  private initColumns(): void {
    const cc = this.colCount();
    this.size = new Array(cc + 1).fill(0);
    for (let j = 0; j <= cc; j++) {
      this.addNode(
        j === 0 ? cc : j - 1,
        j === cc ? 0 : j + 1,
        j, j, j, 0
      );
    }
  }

  private insertNode(column: number, rowId: number, lastInRow: number): number {
    const colHead = column;
    const colUp = this.u[colHead];
    const node = this.addNode(lastInRow, lastInRow, colUp, colHead, column, rowId);
    this.d[colUp] = node;
    this.u[colHead] = node;
    this.size[column]++;
    return node;
  }

  private cover(col: number): void {
    const colNode = col;
    this.r[this.l[colNode]] = this.r[colNode];
    this.l[this.r[colNode]] = this.l[colNode];
    let i = this.d[colNode];
    while (i !== colNode) {
      let j = this.r[i];
      while (j !== i) {
        const jCol = this.col[j];
        this.d[this.u[j]] = this.d[j];
        this.u[this.d[j]] = this.u[j];
        this.size[jCol]--;
        j = this.r[j];
      }
      i = this.d[i];
    }
  }

  private uncover(col: number): void {
    const colNode = col;
    let i = this.u[colNode];
    while (i !== colNode) {
      let j = this.l[i];
      while (j !== i) {
        const jCol = this.col[j];
        this.d[this.u[j]] = j;
        this.u[this.d[j]] = j;
        this.size[jCol]++;
        j = this.l[j];
      }
      i = this.u[i];
    }
    this.r[this.l[colNode]] = colNode;
    this.l[this.r[colNode]] = colNode;
  }

  private search(k: number): void {
    if (this.solutions.length >= this.maxSolutions) return;
    if (this.r[this.head] === this.head) {
      this.solutions.push([...this.solution.slice(0, k)]);
      return;
    }

    let minSize = Infinity;
    let bestCol = 0;
    let j = this.r[this.head];
    while (j !== this.head) {
      const s = this.size[j];
      if (s < minSize) {
        minSize = s;
        bestCol = j;
        if (minSize === 0) return;
        if (minSize === 1) break;
      }
      j = this.r[j];
    }
    if (minSize === 0) return;

    this.cover(bestCol);
    let i = this.d[bestCol];
    while (i !== bestCol) {
      if (this.solutions.length >= this.maxSolutions) break;
      this.solution[k] = this.row[i];

      let j2 = this.r[i];
      while (j2 !== i) {
        this.cover(this.col[j2]);
        j2 = this.r[j2];
      }

      this.search(k + 1);

      j2 = this.l[i];
      while (j2 !== i) {
        this.uncover(this.col[j2]);
        j2 = this.l[j2];
      }

      i = this.d[i];
    }
    this.uncover(bestCol);
  }

  solve(puzzle: Grid): number[][] {
    this.maxSolutions = 2;
    this.initColumns();
    this.buildMatrix(puzzle);
    this.search(0);
    return this.solutions;
  }

  static decodeSolution(rowIds: number[]): Grid {
    const grid = new Grid();
    for (const rid of rowIds) {
      if (rid & 0x80000000) continue;
      const cell = Math.floor(rid / 9);
      const digit = (rid % 9) + 1;
      grid.setValue(cell, digit);
    }
    return grid;
  }

  private regionBase(): number {
    return 324;
  }

  private edgeBase(): number {
    return this.regionBase() + regionColCount(this.extraFlags);
  }

  private edgeColIdx(edgeIdx: number, digit: number): number {
    return this.edgeBase() + edgeIdx * 9 + digit + 1;
  }

  private hyperWindowIdx(window: number, digit: number): number {
    let base = this.regionBase();
    if (this.extraFlags & 1) base += XSUDOKU_EXTRA_COLS;
    return base + window * 9 + digit + 1;
  }

  private buildMatrix(puzzle: Grid): void {
    const flags = this.extraFlags;
    const xdiag = (flags & 1) !== 0;
    const hyper = (flags & 2) !== 0;
    const edges = edgesForFlags(flags);

    const cellEdgeMap: number[][] = Array.from({ length: 81 }, () => []);
    for (let ei = 0; ei < edges.length; ei++) {
      const [a, b] = edges[ei];
      cellEdgeMap[a].push(ei);
      cellEdgeMap[b].push(ei);
    }

    for (let cellIdx = 0; cellIdx < 81; cellIdx++) {
      const row = Math.floor(cellIdx / 9);
      const col = cellIdx % 9;
      const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      const puzzleMask = puzzle.cells[cellIdx];

      for (let d = 0; d < 9; d++) {
        if ((puzzleMask & (1 << d)) === 0) continue;
        const digit = d;
        const rcCol = cellIdx + 1;
        const rdCol = 81 + row * 9 + digit + 1;
        const cdCol = 162 + col * 9 + digit + 1;
        const bdCol = 243 + box * 9 + digit + 1;
        const rowId = cellIdx * 9 + digit;

        const cols: number[] = [rcCol, rdCol, cdCol, bdCol];

        if (xdiag) {
          if (row === col) cols.push(324 + digit + 1);
          if (row + col === 8) cols.push(324 + 9 + digit + 1);
        }

        if (hyper) {
          for (let wi = 0; wi < HYPER_WINDOWS.length; wi++) {
            if (HYPER_WINDOWS[wi].includes(cellIdx)) {
              cols.push(this.hyperWindowIdx(wi, digit));
            }
          }
        }

        if (edges.length > 0) {
          for (const ei of cellEdgeMap[cellIdx]) {
            cols.push(this.edgeColIdx(ei, digit));
          }
        }

        let firstNode = 0;
        let lastNode = 0;
        for (let ci = 0; ci < cols.length; ci++) {
          const node = this.insertNode(cols[ci], rowId, lastNode);
          if (ci === 0) {
            firstNode = node;
          } else {
            this.l[node] = lastNode;
            this.r[lastNode] = node;
          }
          lastNode = node;
        }
        this.l[firstNode] = lastNode;
        this.r[lastNode] = firstNode;
      }
    }

    if (edges.length > 0) {
      for (let ei = 0; ei < edges.length; ei++) {
        for (let digit = 0; digit < 9; digit++) {
          const col = this.edgeColIdx(ei, digit);
          const auxRowId = 0x80000000 | (ei * 9) | digit;
          const node = this.insertNode(col, auxRowId, 0);
          this.l[node] = node;
          this.r[node] = node;
        }
      }
    }
  }
}

export function validateAndSolve(puzzle: Grid): Grid {
  const t0 = Date.now();
  const solver = new DlxSolver(0);
  const solutions = solver.solve(puzzle);
  const elapsed = Date.now() - t0;

  if (solutions.length === 0) {
    throw new Error(`Unsolvable puzzle (0 solutions found in ${elapsed}ms)`);
  }
  if (solutions.length > 1) {
    throw new Error(`Ambiguous puzzle (${solutions.length} solutions found in ${elapsed}ms)`);
  }
  return DlxSolver.decodeSolution(solutions[0]);
}

export function validateAndSolveVariant(puzzle: Grid): Grid {
  const t0 = Date.now();
  const solver = new DlxSolver(1);
  const solutions = solver.solve(puzzle);
  const elapsed = Date.now() - t0;
  if (solutions.length === 0) throw new Error(`Unsolvable puzzle (0 solutions found in ${elapsed}ms)`);
  if (solutions.length > 1) throw new Error(`Ambiguous puzzle (${solutions.length} solutions found in ${elapsed}ms)`);
  return DlxSolver.decodeSolution(solutions[0]);
}

export function validateAndSolveHyper(puzzle: Grid): Grid {
  const t0 = Date.now();
  const solver = new DlxSolver(2);
  const solutions = solver.solve(puzzle);
  const elapsed = Date.now() - t0;
  if (solutions.length === 0) throw new Error(`Unsolvable puzzle (0 solutions found in ${elapsed}ms)`);
  if (solutions.length > 1) throw new Error(`Ambiguous puzzle (${solutions.length} solutions found in ${elapsed}ms)`);
  return DlxSolver.decodeSolution(solutions[0]);
}

export function validateAndSolveAntiknight(puzzle: Grid): Grid {
  const t0 = Date.now();
  const solver = new DlxSolver(4);
  const solutions = solver.solve(puzzle);
  const elapsed = Date.now() - t0;
  if (solutions.length === 0) throw new Error(`Unsolvable puzzle (0 solutions found in ${elapsed}ms)`);
  if (solutions.length > 1) throw new Error(`Ambiguous puzzle (${solutions.length} solutions found in ${elapsed}ms)`);
  return DlxSolver.decodeSolution(solutions[0]);
}

export function validateAndSolveAntiking(puzzle: Grid): Grid {
  const t0 = Date.now();
  const solver = new DlxSolver(8);
  const solutions = solver.solve(puzzle);
  const elapsed = Date.now() - t0;
  if (solutions.length === 0) throw new Error(`Unsolvable puzzle (0 solutions found in ${elapsed}ms)`);
  if (solutions.length > 1) throw new Error(`Ambiguous puzzle (${solutions.length} solutions found in ${elapsed}ms)`);
  return DlxSolver.decodeSolution(solutions[0]);
}

export function solveVariantViaDlx(puzzle: Grid, variant: string): Grid | null {
  const fn = getSolveFn(variant);
  if (!fn) return null;
  return fn(puzzle);
}

function getSolveFn(variant: string): ((p: Grid) => Grid) | null {
  switch (variant) {
    case "xsudoku": return validateAndSolveVariant;
    case "hyper": return validateAndSolveHyper;
    case "antiknight": return validateAndSolveAntiknight;
    case "antiking": return validateAndSolveAntiking;
    default: return null;
  }
}
