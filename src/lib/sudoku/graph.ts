import { Grid, cellRow, cellCol, cellBox, rcIdx, rowCells, colCells, boxCells, cellName, type CellIdx, type Digit, type CandidateMask } from "./types";

export const REGULAR_VERTEX_COUNT = 729;
export const MAX_GROUPED_VERTICES = 486;
export const MAX_ALS_VERTICES = 324;
export const TOTAL_VERTEX_CAPACITY = REGULAR_VERTEX_COUNT + MAX_GROUPED_VERTICES + MAX_ALS_VERTICES;

export function vertexIdx(cell: number, digit: Digit): number {
  return cell * 9 + (digit - 1);
}

export function vertexCell(v: number): CellIdx {
  return Math.floor(v / 9);
}

export function vertexDigit(v: number): Digit {
  return (v % 9) + 1;
}

export function isRegularVertex(v: number): boolean {
  return v < REGULAR_VERTEX_COUNT;
}

export function isGroupedVertex(v: number): boolean {
  return v >= REGULAR_VERTEX_COUNT && v < REGULAR_VERTEX_COUNT + MAX_GROUPED_VERTICES;
}

export interface GroupedVertexInfo {
  groupIdx: number;
  digit: Digit;
  cells: CellIdx[];
  confinementType: number;
  unitIdx: number;
}

export interface AlsVertexInfo {
  alsIdx: number;
  cells: CellIdx[];
  candidates: CandidateMask;
  extraDigit: Digit;
}

export enum TruthValue { Unknown, True, False }
export enum LinkType { Weak, Strong }

export interface PropEdge {
  from: number;
  linkType: LinkType;
}

export interface ContradictionInfo {
  vertex: number;
  assignedAs: TruthValue;
  previouslyAs: TruthValue;
}

export interface PropagationResult {
  states: TruthValue[];
  contradiction: ContradictionInfo | null;
  predecessor: (PropEdge | null)[];
}

export class ImplicationGraph {
  weakFromTrue: number[][];
  strongFromFalse: number[][];
  groupedVertexInfo: GroupedVertexInfo[];
  alsVertexInfo: AlsVertexInfo[];
  totalVertices: number;

  constructor(grid: Grid) {
    const weak: number[][] = Array.from({ length: TOTAL_VERTEX_CAPACITY }, () => []);
    const strong: number[][] = Array.from({ length: TOTAL_VERTEX_CAPACITY }, () => []);
    const groupedInfo: GroupedVertexInfo[] = [];

    for (let cell = 0; cell < 81; cell++) {
      const mask = grid.cells[cell];
      const digits: number[] = [];
      for (let d = 0; d < 9; d++) {
        if (mask & (1 << d)) digits.push(d);
      }

      for (const di of digits) {
        const vi = cell * 9 + di;
        for (const dj of digits) {
          if (di !== dj) {
            weak[vi].push(cell * 9 + dj);
          }
        }
      }

      if (digits.length === 2) {
        const v0 = cell * 9 + digits[0];
        const v1 = cell * 9 + digits[1];
        strong[v0].push(v1);
        strong[v1].push(v0);
      }
    }

    for (let unitType = 0; unitType < 27; unitType++) {
      let unitCells: number[];
      if (unitType < 9) unitCells = rowCells(unitType);
      else if (unitType < 18) unitCells = colCells(unitType - 9);
      else unitCells = boxCells(unitType - 18);

      for (let digit = 0; digit < 9; digit++) {
        const candidates: number[] = [];
        for (const c of unitCells) {
          if (grid.cells[c] & (1 << digit)) candidates.push(c);
        }

        for (const c1 of candidates) {
          const v1 = c1 * 9 + digit;
          for (const c2 of candidates) {
            if (c1 !== c2) {
              weak[v1].push(c2 * 9 + digit);
            }
          }
        }

        if (candidates.length === 2) {
          const v0 = candidates[0] * 9 + digit;
          const v1 = candidates[1] * 9 + digit;
          strong[v0].push(v1);
          strong[v1].push(v0);
        }
      }
    }

    let nextGroupIdx = REGULAR_VERTEX_COUNT;

    for (let box = 0; box < 9; box++) {
      const bCells = boxCells(box);
      for (let digit = 0; digit < 9; digit++) {
        const dMask = 1 << digit;
        const rowMap: number[][] = [[], [], []];
        const colMap: number[][] = [[], [], []];

        for (const c of bCells) {
          if (grid.cells[c] & dMask) {
            const r = Math.floor(c / 9) % 3;
            const col = c % 9 % 3;
            rowMap[r].push(c);
            colMap[col].push(c);
          }
        }

        for (let ri = 0; ri < 3; ri++) {
          if (rowMap[ri].length >= 2 && rowMap[ri].length <= 3) {
            const rowInGrid = Math.floor(box / 3) * 3 + ri;
            const groupVertex = nextGroupIdx++;
            groupedInfo.push({
              groupIdx: groupVertex,
              digit: (digit + 1),
              cells: [...rowMap[ri]],
              confinementType: 0,
              unitIdx: rowInGrid,
            });
            for (const gc of rowMap[ri]) {
              weak[groupVertex].push(gc * 9 + digit);
            }
            for (let c = 0; c < 9; c++) {
              const cell = rcIdx(rowInGrid, c);
              if (!rowMap[ri].includes(cell) && (grid.cells[cell] & dMask)) {
                weak[groupVertex].push(cell * 9 + digit);
              }
            }
          }
        }

        for (let ci = 0; ci < 3; ci++) {
          if (colMap[ci].length >= 2 && colMap[ci].length <= 3) {
            const colInGrid = (box % 3) * 3 + ci;
            const groupVertex = nextGroupIdx++;
            groupedInfo.push({
              groupIdx: groupVertex,
              digit: (digit + 1),
              cells: [...colMap[ci]],
              confinementType: 1,
              unitIdx: colInGrid,
            });
            for (const gc of colMap[ci]) {
              weak[groupVertex].push(gc * 9 + digit);
            }
            for (let r = 0; r < 9; r++) {
              const cell = rcIdx(r, colInGrid);
              if (!colMap[ci].includes(cell) && (grid.cells[cell] & dMask)) {
                weak[groupVertex].push(cell * 9 + digit);
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < weak.length; i++) {
      weak[i] = [...new Set(weak[i])];
    }
    for (let i = 0; i < strong.length; i++) {
      strong[i] = [...new Set(strong[i])];
    }

    this.weakFromTrue = weak;
    this.strongFromFalse = strong;
    this.groupedVertexInfo = groupedInfo;
    this.alsVertexInfo = [];
    this.totalVertices = nextGroupIdx;
  }

  propagateFrom(startVertex: number, assumeTrue: boolean): PropagationResult {
    const n = Math.max(this.totalVertices, REGULAR_VERTEX_COUNT);
    const states = new Array(n).fill(TruthValue.Unknown);
    const predecessor: (PropEdge | null)[] = new Array(n).fill(null);
    const queue: number[] = [];

    states[startVertex] = assumeTrue ? TruthValue.True : TruthValue.False;
    queue.push(startVertex);

    while (queue.length > 0) {
      const v = queue.shift()!;
      const currentValue = states[v];
      const edges = currentValue === TruthValue.True ? this.weakFromTrue[v] : this.strongFromFalse[v];
      const nextValue = currentValue === TruthValue.True ? TruthValue.False : TruthValue.True;

      for (const w of edges) {
        if (w >= states.length) continue;
        if (states[w] === TruthValue.Unknown) {
          states[w] = nextValue;
          predecessor[w] = { from: v, linkType: currentValue === TruthValue.True ? LinkType.Weak : LinkType.Strong };
          queue.push(w);
        } else if (states[w] !== nextValue) {
          return {
            states,
            contradiction: { vertex: w, assignedAs: nextValue, previouslyAs: states[w] },
            predecessor,
          };
        }
      }
    }

    return { states, contradiction: null, predecessor };
  }

  findContradictionChain(grid: Grid): { startVertex: number; result: PropagationResult } | null {
    for (let cell = 0; cell < 81; cell++) {
      const mask = grid.cells[cell];
      if (mask === 0 || (mask & (mask - 1)) !== 0) {
        for (let d = 0; d < 9; d++) {
          if (mask & (1 << d)) {
            const v = cell * 9 + d;
            const result = this.propagateFrom(v, true);
            if (result.contradiction) {
              return { startVertex: v, result };
            }
          }
        }
      }
    }
    return null;
  }

  traceChain(start: number, result: PropagationResult): Array<[number, TruthValue, LinkType]> {
    const chain: Array<[number, TruthValue, LinkType]> = [];

    if (result.contradiction) {
      const conflictVertex = result.contradiction.vertex;
      const path1: Array<[number, TruthValue, LinkType]> = [];
      let current = conflictVertex;
      while (true) {
        const edge = result.predecessor[current];
        if (!edge) break;
        const prevState = edge.linkType === LinkType.Weak ? TruthValue.True : TruthValue.False;
        path1.push([current, prevState, edge.linkType]);
        current = edge.from;
        if (current === start) {
          path1.push([start, result.states[start] ?? TruthValue.Unknown, LinkType.Weak]);
          break;
        }
      }
      for (let i = path1.length - 1; i >= 0; i--) {
        chain.push(path1[i]);
      }
    }

    return chain;
  }
}

export function reconstructChainCommands(
  chain: Array<[number, TruthValue, LinkType]>,
  graph: ImplicationGraph
): { cell: string; digit: number; state: string }[] {
  const steps: { cell: string; digit: number; state: string }[] = [];
  for (const [v, state] of chain) {
    if (v < REGULAR_VERTEX_COUNT) {
      const cell = vertexCell(v);
      const digit = vertexDigit(v);
      const stateStr = state === TruthValue.True ? "MUST_BE" : state === TruthValue.False ? "CANNOT_BE" : "UNKNOWN";
      steps.push({ cell: cellName(cell), digit, state: stateStr });
    } else if (isGroupedVertex(v)) {
      const info = graph.groupedVertexInfo.find(g => g.groupIdx === v);
      if (info) {
        const cellList = info.cells.map(c => cellName(c)).join(",");
        const stateStr = state === TruthValue.True ? "GROUP_ON" : state === TruthValue.False ? "GROUP_OFF" : "UNKNOWN";
        steps.push({ cell: `[${cellList}]`, digit: info.digit, state: stateStr });
      }
    }
  }
  return steps;
}
