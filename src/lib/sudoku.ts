import type { CellState, CellValue, SolveStep, SolveStepMutation, HintHighlights, Cage } from "./types";

export const EMPTY_CELL = (): CellState => ({
  value: null,
  given: false,
  candidates: new Set(),
  centerMarks: new Set(),
  conflict: false,
  highlighted: false,
  colors: [],
});

export function puzzleStringToCells(puzzle: string): CellState[] {
  const cells: CellState[] = [];
  for (const ch of puzzle) {
    const cell = EMPTY_CELL();
    if (ch !== "." && ch !== "0") {
      cell.value = parseInt(ch);
      cell.given = true;
    }
    cells.push(cell);
  }
  return cells;
}

export function cellsToPuzzleString(cells: CellState[]): string {
  return cells
    .map((c) => (c.value !== null ? c.value.toString() : "."))
    .join("");
}

export function cellsToUserSolution(cells: CellState[]): string {
  return cells
    .map((c) => (c.value !== null ? c.value.toString() : "."))
    .join("");
}

export function findConflicts(cells: CellState[]): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (cells[i].value === null) continue;
    const row = Math.floor(i / 9);
    const col = i % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const v = cells[i].value!;
    for (let j = 0; j < 81; j++) {
      if (i === j || cells[j].value === null) continue;
      const r = Math.floor(j / 9);
      const c = j % 9;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (cells[j].value === v && (row === r || col === c || box === b)) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
  }
  return conflicts;
}

export function findCageConflicts(cells: CellState[], cages: Cage[]): Set<number> {
  const conflicts = new Set<number>();
  for (const cage of cages) {
    const seen = new Map<number, number>();
    let filledCount = 0;
    let sum = 0;
    for (const idx of cage.cells) {
      const v = cells[idx]?.value;
      if (v === null) continue;
      filledCount++;
      sum += v;
      if (seen.has(v)) {
        conflicts.add(idx);
        conflicts.add(seen.get(v)!);
      }
      seen.set(v, idx);
    }
    if (filledCount === cage.cells.length && sum !== cage.sum) {
      for (const idx of cage.cells) conflicts.add(idx);
    }
  }
  return conflicts;
}

export function allCandidates(cells: CellState[]): CellState[] {
  const result = cells.map((c) => ({ ...c, candidates: new Set<number>() }));
  for (let i = 0; i < 81; i++) {
    if (result[i].value !== null) continue;
    const row = Math.floor(i / 9);
    const col = i % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const used = new Set<number>();
    for (let j = 0; j < 81; j++) {
      const v = result[j].value;
      if (v === null) continue;
      const r = Math.floor(j / 9);
      const c = j % 9;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (row === r || col === c || box === b) {
        used.add(v);
      }
    }
    for (let d = 1; d <= 9; d++) {
      if (!used.has(d)) result[i].candidates.add(d);
    }
  }
  return result;
}

const HYPER_WINDOWS: number[][] = [
  [10, 11, 12, 19, 20, 21, 28, 29, 30],
  [14, 15, 16, 23, 24, 25, 32, 33, 34],
  [46, 47, 48, 55, 56, 57, 64, 65, 66],
  [50, 51, 52, 59, 60, 61, 68, 69, 70],
];

export function findHyperConflicts(cells: CellState[]): number[] {
  const conflicts: number[] = [];
  for (const window of HYPER_WINDOWS) {
    const seen = new Map<number, number>();
    for (const idx of window) {
      const v = cells[idx]?.value;
      if (v === null) continue;
      if (seen.has(v)) {
        if (!conflicts.includes(idx)) conflicts.push(idx);
        const other = seen.get(v)!;
        if (!conflicts.includes(other)) conflicts.push(other);
      }
      seen.set(v, idx);
    }
  }
  return conflicts;
}

export function findDiagonalConflicts(cells: CellState[]): number[] {
  const conflicts: number[] = [];
  const mainDiag: number[] = [];
  const antiDiag: number[] = [];
  for (let i = 0; i < 9; i++) {
    mainDiag.push(i * 10);
    antiDiag.push(i * 9 + (8 - i));
  }
  const check = (indices: number[]) => {
    const seen = new Map<number, number>();
    for (const idx of indices) {
      const v = cells[idx]?.value;
      if (v === null) continue;
      if (seen.has(v)) {
        if (!conflicts.includes(idx)) conflicts.push(idx);
        const other = seen.get(v)!;
        if (!conflicts.includes(other)) conflicts.push(other);
      }
      seen.set(v, idx);
    }
  };
  check(mainDiag);
  check(antiDiag);
  return conflicts;
}

const KNIGHT_MOVES: [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export function findAntiKnightConflicts(cells: CellState[]): number[] {
  const conflicts: number[] = [];
  for (let i = 0; i < 81; i++) {
    const v = cells[i]?.value;
    if (v === null) continue;
    const r = Math.floor(i / 9), c = i % 9;
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
      const j = nr * 9 + nc;
      if (cells[j]?.value === v) {
        if (!conflicts.includes(i)) conflicts.push(i);
        if (!conflicts.includes(j)) conflicts.push(j);
      }
    }
  }
  return conflicts;
}

const KING_MOVES: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

export function findAntiKingConflicts(cells: CellState[]): number[] {
  const conflicts: number[] = [];
  for (let i = 0; i < 81; i++) {
    const v = cells[i]?.value;
    if (v === null) continue;
    const r = Math.floor(i / 9), c = i % 9;
    for (const [dr, dc] of KING_MOVES) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
      const j = nr * 9 + nc;
      if (cells[j]?.value === v) {
        if (!conflicts.includes(i)) conflicts.push(i);
        if (!conflicts.includes(j)) conflicts.push(j);
      }
    }
  }
  return conflicts;
}

export function isSolved(cells: CellState[]): boolean {
  for (const cell of cells) {
    if (cell.value === null) return false;
  }
  return findConflicts(cells).size === 0;
}

function eliminatePeerCandidates(cells: CellState[], idx: number, digit: number): void {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  for (let j = 0; j < 81; j++) {
    if (j === idx || cells[j].value !== null) continue;
    const r = Math.floor(j / 9);
    const c = j % 9;
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    if (row !== r && col !== c && box !== b) continue;
    const newCandidates = new Set(cells[j].candidates);
    if (newCandidates.delete(digit)) {
      cells[j] = { ...cells[j], candidates: newCandidates };
    }
  }
}

export function applyStepsToGrid(
  initialCells: CellState[],
  steps: SolveStep[],
  upToStep: number
): CellState[] {
  let cells = allCandidates(
    initialCells.map((c) => ({
      ...c,
      candidates: new Set(c.candidates),
      highlighted: false,
    }))
  );
  for (let i = 0; i < upToStep; i++) {
    const step = steps[i];
    for (const m of step.mutations) {
      const idx = parseR1C1(m.cell);
      if (idx === null) continue;
      if (m.action === "SET_VALUE") {
        cells[idx] = { ...cells[idx], value: m.digit, candidates: new Set(), highlighted: false };
        eliminatePeerCandidates(cells, idx, m.digit);
      } else {
        const newCandidates = new Set(cells[idx].candidates);
        if (newCandidates.delete(m.digit)) {
          cells[idx] = { ...cells[idx], candidates: newCandidates, highlighted: false };
        }
      }
    }
  }
  return cells;
}

export function getHighlightedCellsForStep(
  cells: CellState[],
  steps: SolveStep[],
  stepIndex: number
): { setCells: Set<number>; removeCells: Set<number>; proofCells: Set<number> } {
  const setCells = new Set<number>();
  const removeCells = new Set<number>();
  const proofCells = new Set<number>();

  if (stepIndex < 0 || stepIndex >= steps.length) {
    return { setCells, removeCells, proofCells };
  }

  const step = steps[stepIndex];
  for (const m of step.mutations) {
    const idx = parseR1C1(m.cell);
    if (idx === null) continue;
    if (m.action === "SET_VALUE") {
      setCells.add(idx);
    } else {
      removeCells.add(idx);
    }
  }

  for (const p of step.proofChain) {
    const idx = parseR1C1(p.cell);
    if (idx !== null) {
      proofCells.add(idx);
    }
  }

  return { setCells, removeCells, proofCells };
}

export function parseR1C1(cell: string): number | null {
  const match = cell.match(/R(\d+)C(\d+)/);
  if (!match) return null;
  const r = parseInt(match[1]) - 1;
  const c = parseInt(match[2]) - 1;
  return r * 9 + c;
}

function parseUnitIndices(description: string): number[] {
  const rowMatch = description.match(/[Rr]ow\s+(\d+)/);
  const colMatch = description.match(/[Cc]olumn\s+(\d+)/);
  const boxMatch = description.match(/[Bb]ox\s+(\d+)/);
  if (rowMatch) {
    const r = parseInt(rowMatch[1]) - 1;
    return Array.from({ length: 9 }, (_, c) => r * 9 + c);
  }
  if (colMatch) {
    const c = parseInt(colMatch[1]) - 1;
    return Array.from({ length: 9 }, (_, r) => r * 9 + c);
  }
  if (boxMatch) {
    const b = parseInt(boxMatch[1]) - 1;
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    const indices: number[] = [];
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        indices.push(r * 9 + c);
      }
    }
    return indices;
  }
  return [];
}

export function computeHintHighlights(
  mutations: SolveStepMutation[],
  proofChain: { cell: string; digit: number; state: string }[],
  description: string,
  cells: CellState[],
): HintHighlights {
  const greenCells: number[] = [];
  const redCellsSet = new Set<number>();
  const eliminationCandidates: { cellIndex: number; digit: number }[] = [];

  const setTargets: { idx: number; digit: number }[] = [];
  for (const m of mutations) {
    const idx = parseR1C1(m.cell);
    if (idx === null) continue;
    if (m.action === "SET_VALUE") {
      greenCells.push(idx);
      setTargets.push({ idx, digit: m.digit });
    } else {
      redCellsSet.add(idx);
      eliminationCandidates.push({ cellIndex: idx, digit: m.digit });
    }
  }

  for (const p of proofChain) {
    const idx = parseR1C1(p.cell);
    if (idx !== null && p.state === "trial") {
      redCellsSet.add(idx);
    }
  }

  const unitCells = parseUnitIndices(description);

  for (const { idx: targetIdx, digit } of setTargets) {
    const targetRow = Math.floor(targetIdx / 9);
    const targetCol = targetIdx % 9;
    const targetBox = Math.floor(targetRow / 3) * 3 + Math.floor(targetCol / 3);

    for (const ui of unitCells) {
      if (ui === targetIdx || cells[ui]?.value) continue;
      const ur = Math.floor(ui / 9);
      const uc = ui % 9;
      const ub = Math.floor(ur / 3) * 3 + Math.floor(uc / 3);

      let blocked = false;
      for (let i = 0; i < 81; i++) {
        if (i === ui || !cells[i]?.value) continue;
        if (cells[i]?.value !== digit) continue;
        const r = Math.floor(i / 9);
        const c = i % 9;
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        if (r === ur || c === uc || b === ub) {
          blocked = true;
          redCellsSet.add(i);
          eliminationCandidates.push({ cellIndex: ui, digit });
        }
      }
      if (blocked) {
        redCellsSet.add(ui);
      }
    }

    for (let i = 0; i < 81; i++) {
      if (i === targetIdx || !cells[i]?.value || cells[i]?.value !== digit) continue;
      const r = Math.floor(i / 9);
      const c = i % 9;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (r === targetRow || c === targetCol || b === targetBox) {
        redCellsSet.add(i);
      }
    }
  }

  return { greenCells, redCells: Array.from(redCellsSet), eliminationCandidates, unitCells };
}

export function cellName(idx: number): string {
  return `R${Math.floor(idx / 9) + 1}C${(idx % 9) + 1}`;
}

export function generateFillSteps(
  initialPuzzle: string,
  solution: string,
  pipelineSteps: SolveStep[]
): SolveStep[] {
  const steps = [...pipelineSteps];
  const initialState = puzzleStringToCells(initialPuzzle);
  const afterPipeline = applyStepsToGrid(initialState, steps, steps.length);
  for (let i = 0; i < 81; i++) {
    if (initialState[i].given) continue;
    if (afterPipeline[i].value !== null) continue;
    const answer = parseInt(solution[i]);
    if (isNaN(answer) || answer < 1 || answer > 9) continue;
    const name = cellName(i);
    const removed: number[] = [];
    for (let d = 1; d <= 9; d++) {
      if (d !== answer && afterPipeline[i].candidates.has(d)) {
        removed.push(d);
      }
    }
    if (removed.length > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        strategyName: "Auto Fill",
        isFallbackUsed: true,
        description: `Eliminating impossible candidates from ${name}.`,
        mutations: removed.map((d) => ({ cell: name, action: "REMOVE_PENCIL_MARK" as const, digit: d })),
        proofChain: [],
      });
    }
    steps.push({
      stepNumber: steps.length + 1,
      strategyName: "Auto Fill",
      isFallbackUsed: true,
      description: `${name} must be ${answer}.`,
      mutations: [{ cell: name, action: "SET_VALUE" as const, digit: answer }],
      proofChain: [],
    });
  }
  return steps;
}

export function deepCloneCells(cells: CellState[]): CellState[] {
  return cells.map((c) => ({
    ...c,
    candidates: new Set(c.candidates),
    centerMarks: new Set(c.centerMarks),
    colors: [...c.colors],
  }));
}

export function toggleColor(colors: string[], color: string): string[] {
  if (colors.includes(color)) {
    return colors.filter((c) => c !== color);
  }
  return [...colors, color];
}
