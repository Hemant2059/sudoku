import { Grid, type CellIdx } from "./types";
import { generatePuzzle, Difficulty } from "./generator";

function splitmix64(seed: number): number {
  let z = seed >>> 0;
  z = Math.imul(z ^ (z >>> 30), 0xbf58476d);
  z = Math.imul(z ^ (z >>> 27), 0x94d049bb);
  return (z ^ (z >>> 31)) >>> 0;
}

function shuffle(rng: () => number, arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function createRng(): () => number {
  let state = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
  return () => {
    state = splitmix64(state);
    return state;
  };
}

export interface Cage {
  cells: number[];
  sum: number;
}

export interface KillerPuzzleData {
  puzzle: string;
  solution: string;
  cages: Cage[];
}

function getAdjacentUnassigned(cell: number, assigned: boolean[]): number[] {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  const result: number[] = [];
  if (r > 0) { const idx = cell - 9; if (!assigned[idx]) result.push(idx); }
  if (r < 8) { const idx = cell + 9; if (!assigned[idx]) result.push(idx); }
  if (c > 0) { const idx = cell - 1; if (!assigned[idx]) result.push(idx); }
  if (c < 8) { const idx = cell + 1; if (!assigned[idx]) result.push(idx); }
  return result;
}

function getAllAdjacent(cell: number): number[] {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  const result: number[] = [];
  if (r > 0) result.push(cell - 9);
  if (r < 8) result.push(cell + 9);
  if (c > 0) result.push(cell - 1);
  if (c < 8) result.push(cell + 1);
  return result;
}

function partitionIntoCages(rng: () => number): number[][] {
  const assigned = new Array(81).fill(false);
  const cages: number[][] = [];

  const allCells = Array.from({ length: 81 }, (_, i) => i);
  shuffle(rng, allCells);

  for (const cell of allCells) {
    if (assigned[cell]) continue;

    const cage = [cell];
    assigned[cell] = true;
    const targetExtra = 1 + (rng() % 3);
    const candidates = getAdjacentUnassigned(cell, assigned);

    for (let i = 0; i < targetExtra; i++) {
      if (candidates.length === 0) break;
      const idx = rng() % candidates.length;
      const next = candidates.splice(idx, 1)[0];
      cage.push(next);
      assigned[next] = true;
      const newNeighbors = getAdjacentUnassigned(next, assigned);
      for (const n of newNeighbors) {
        if (!candidates.includes(n)) candidates.push(n);
      }
    }

    cages.push(cage);
  }

  let mergedAny = true;
  while (mergedAny) {
    mergedAny = false;
    let i = 0;
    while (i < cages.length) {
      if (cages[i].length > 1) { i++; continue; }
      const lone = cages[i][0];
      const neighbors = getAllAdjacent(lone);
      let merged = false;
      for (let j = 0; j < cages.length; j++) {
        if (i === j || cages[j].length === 0) continue;
        if (cages[j].some(c => neighbors.includes(c))) {
          const absorbed = cages.splice(i, 1)[0];
          cages[j].push(...absorbed);
          merged = true;
          mergedAny = true;
          break;
        }
      }
      if (!merged) i++;
    }
  }

  return cages;
}

export function generateKillerPuzzle(): KillerPuzzleData {
  const gen = generatePuzzle(Difficulty.Medium);
  const solution = gen.solution;
  const rng = createRng();

  const rawCages = partitionIntoCages(rng);

  const cages: Cage[] = rawCages.map(cells => {
    const sum = cells.reduce((acc, idx) => acc + (solution.value(idx) || 0), 0);
    return { cells, sum };
  });

  const empty = new Grid();
  return { puzzle: empty.toString(), solution: solution.toString(), cages };
}

export function verifyKiller(
  _puzzleStr: string,
  cages: Cage[],
  userSolutionStr: string,
): string {
  const user = Grid.fromString(userSolutionStr);

  if (!user.isSolved()) {
    throw new Error("Solution is not complete.");
  }

  for (let i = 0; i < cages.length; i++) {
    const cage = cages[i];
    const seen = new Array(10).fill(false);
    let sum = 0;
    for (const idx of cage.cells) {
      const d = user.value(idx) || 0;
      if (d === 0) throw new Error(`Cage ${i + 1} has empty cell R${Math.floor(idx / 9) + 1}C${(idx % 9) + 1}`);
      if (seen[d]) throw new Error(`Cage ${i + 1} (sum ${cage.sum}) has duplicate digit ${d}`);
      seen[d] = true;
      sum += d;
    }
    if (sum !== cage.sum) {
      throw new Error(`Cage ${i + 1} sum is ${sum} but should be ${cage.sum}`);
    }
  }

  return "✓ Correct! All cages satisfied.";
}
