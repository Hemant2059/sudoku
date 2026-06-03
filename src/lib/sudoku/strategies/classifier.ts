import { ImplicationGraph, REGULAR_VERTEX_COUNT, TruthValue, LinkType, vertexCell, vertexDigit } from "../graph";
import { Grid, cellRow, cellCol, cellBox, cellName, isRCRelated, digitToBit, type CellIdx, type CandidateMask } from "../types";

export interface ClassifiedStrategy {
  name: string;
  description: string;
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0F0F0F0F;
  return (x * 0x01010101) >>> 24;
}

function bitToDigit(bit: number): number | null {
  if (bit === 0) return null;
  let n = 0;
  let b = bit;
  while ((b & 1) === 0) { n++; b >>>= 1; }
  return n + 1;
}

export function classifyAicChain(
  chain: Array<[number, TruthValue, LinkType]>,
  grid: Grid
): ClassifiedStrategy {
  if (chain.length === 0) {
    return { name: "ALTERNATING_INFERENCE_CHAIN", description: "Alternating Inference Chain found a contradiction." };
  }

  const regularChain = chain.filter(([v]) => v < REGULAR_VERTEX_COUNT);
  if (regularChain.length < 2) {
    return { name: "ALTERNATING_INFERENCE_CHAIN", description: "Chain too short for classification." };
  }

  const uniqueDigits = new Set(regularChain.map(([v]) => v % 9));
  const uniqueCells = new Set(regularChain.map(([v]) => vertexCell(v)));

  if (uniqueDigits.size === 1) {
    const digit = ([...uniqueDigits][0] as number) + 1;
    const corners = extractFishCorners(regularChain);
    if (corners.length === 4) {
      const cells = corners.map(([r, c]) => `R${r + 1}C${c + 1}`);
      return {
        name: "X-WING",
        description: `X-Wing on digit ${digit}: cells ${cells.join(", ")} form a 4-corner rectangle. Digit ${digit} is eliminated from other cells in the covering rows/columns.`,
      };
    }
    if (corners.length === 6) {
      const cells = corners.map(([r, c]) => `R${r + 1}C${c + 1}`);
      return {
        name: "SWORDFISH",
        description: `Swordfish on digit ${digit}: cells ${cells.join(", ")} form a 6-corner pattern. Digit ${digit} is eliminated from other cells in the covering rows/columns.`,
      };
    }
    return {
      name: "X-CYCLE",
      description: `X-Cycle on digit ${digit}: a closed alternating loop of strong and weak links forces an elimination.`,
    };
  }

  if (uniqueDigits.size === 2 && uniqueCells.size >= 3) {
    const allBiValue = [...uniqueCells].every(c => popcount(grid.candidates(c)) === 2);
    if (allBiValue) {
      if (uniqueCells.size === 3) {
        const cellsVec = [...uniqueCells];
        const yWingDesc = checkYWing(cellsVec, grid);
        if (yWingDesc) {
          return { name: "Y-WING", description: yWingDesc };
        }
      }
      const digitNames = [...uniqueDigits].map(d => String((d as number) + 1));
      const cellNames = [...uniqueCells].map(c => cellName(c as number));
      return {
        name: "XY-CHAIN",
        description: `XY-Chain: bi-value cells ${cellNames.join(", ")} alternate between digits ${digitNames.join("/")}.`,
      };
    }
  }

  if (uniqueCells.size === 4 && uniqueDigits.size === 2) {
    const cellsVec = [...uniqueCells] as number[];
    const urDesc = checkUniqueRectangle(cellsVec, grid);
    if (urDesc) {
      return { name: "UNIQUE_RECTANGLE", description: urDesc };
    }
  }

  return { name: "ALTERNATING_INFERENCE_CHAIN", description: "General alternating inference chain with mixed candidates." };
}

function extractFishCorners(chain: Array<[number, TruthValue, LinkType]>): [number, number][] {
  const corners: [number, number][] = [];
  const seen = new Set<string>();
  for (const [v, state] of chain) {
    if (v >= REGULAR_VERTEX_COUNT) continue;
    if (state !== TruthValue.True) continue;
    const cell = vertexCell(v);
    const r = cellRow(cell);
    const c = cellCol(cell);
    const key = `${r},${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      corners.push([r, c]);
    }
  }
  return corners;
}

function checkYWing(cells: number[], grid: Grid): string | null {
  if (cells.length !== 3) return null;
  const masks = cells.map(c => grid.candidates(c));
  const pops = masks.map(m => popcount(m));
  if (pops.some(p => p !== 2)) return null;

  for (let pivotIdx = 0; pivotIdx < 3; pivotIdx++) {
    const pivot = cells[pivotIdx];
    const pincer1 = cells[(pivotIdx + 1) % 3];
    const pincer2 = cells[(pivotIdx + 2) % 3];
    const pivotMask = grid.candidates(pivot);
    const p1Mask = grid.candidates(pincer1);
    const p2Mask = grid.candidates(pincer2);
    const sharedWithP1 = pivotMask & p1Mask;
    const sharedWithP2 = pivotMask & p2Mask;

    if (popcount(sharedWithP1) === 1 && popcount(sharedWithP2) === 1
      && sharedWithP1 !== sharedWithP2
      && isRCRelated(pivot, pincer1) && isRCRelated(pivot, pincer2)) {
      const sharedDigit = bitToDigit(p1Mask & p2Mask) || 0;
      return `Y-Wing: pivot cell ${cellName(pivot)} connects pincers ${cellName(pincer1)} and ${cellName(pincer2)}. Digit ${sharedDigit} can be eliminated from cells that see both pincers.`;
    }
  }
  return null;
}

function checkUniqueRectangle(cells: number[], grid: Grid): string | null {
  if (cells.length !== 4) return null;
  const rows = new Set(cells.map(c => cellRow(c)));
  const cols = new Set(cells.map(c => cellCol(c)));
  const boxes = new Set(cells.map(c => cellBox(c)));
  if (rows.size !== 2 || cols.size !== 2 || boxes.size !== 2) return null;

  const masks = cells.map(c => grid.candidates(c));
  const allCandidates = masks.reduce((acc, m) => acc | m, 0);
  if (popcount(allCandidates) !== 2) return null;

  const digits: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (allCandidates & digitToBit(d)) digits.push(d);
  }
  if (digits.length !== 2) return null;

  const cellNames = cells.map(c => cellName(c));
  return `Unique Rectangle in cells ${cellNames.join(", ")} with digits ${digits[0]} and ${digits[1]}. The puzzle would have multiple solutions if both digits can be swapped in these cells. This forces an elimination.`;
}

export function classifyFish(dimension: number, digit: number): ClassifiedStrategy {
  const name = dimension === 4 ? "JELLYFISH" : dimension === 3 ? "SWORDFISH" : "X-WING";
  return {
    name,
    description: `${name} on digit ${digit}: a ${dimension}-dimensional fish pattern found via bitmask analysis across base sets.`,
  };
}
