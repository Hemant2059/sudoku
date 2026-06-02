import { describe, it, expect } from "vitest";
import {
  EMPTY_CELL,
  puzzleStringToCells,
  cellsToPuzzleString,
  findConflicts,
  findCageConflicts,
  allCandidates,
  isSolved,
  parseR1C1,
  deepCloneCells,
} from "../sudoku";

const VALID_PUZZLE =
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const PUZZLE_DOTS =
  "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79";

describe("puzzleStringToCells", () => {
  it("creates 81 cells", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    expect(cells).toHaveLength(81);
  });

  it("marks given cells correctly", () => {
    const cells = puzzleStringToCells("5................");
    expect(cells[0].value).toBe(5);
    expect(cells[0].given).toBe(true);
  });

  it("marks empty cells", () => {
    const cells = puzzleStringToCells("5................");
    expect(cells[1].value).toBeNull();
    expect(cells[1].given).toBe(false);
  });
});

describe("cellsToPuzzleString", () => {
  it("converts back to dot format string", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    expect(cellsToPuzzleString(cells)).toBe(PUZZLE_DOTS);
  });
});

describe("findConflicts", () => {
  it("finds no conflicts in empty grid", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    expect(findConflicts(cells).size).toBe(0);
  });

  it("finds conflicts for duplicate values in same row", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    cells[1].value = 5;
    const conflicts = findConflicts(cells);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(1)).toBe(true);
  });

  it("finds conflicts for duplicate values in same column", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    cells[9].value = 5;
    const conflicts = findConflicts(cells);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(9)).toBe(true);
  });

  it("finds conflicts for duplicate values in same box", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    cells[10].value = 5;
    const conflicts = findConflicts(cells);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(10)).toBe(true);
  });
});

describe("allCandidates", () => {
  it("computes candidates for empty cells", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    const result = allCandidates(cells);
    const emptyCell = result.find(
      (c) => !c.value && c.candidates.size > 0
    );
    expect(emptyCell).toBeDefined();
  });

  it("returns givens unchanged", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    const result = allCandidates(cells);
    expect(result[0].value).toBe(5);
    expect(result[0].given).toBe(true);
    expect(result[0].candidates.size).toBe(0);
  });
});

describe("isSolved", () => {
  it("returns false for empty grid", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    expect(isSolved(cells)).toBe(false);
  });

  it("returns true for a solved grid", () => {
    const solution =
      "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
    const cells = puzzleStringToCells(solution);
    expect(isSolved(cells)).toBe(true);
  });

  it("returns false for partial grid", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    expect(isSolved(cells)).toBe(false);
  });
});

describe("parseR1C1", () => {
  it("parses R1C1 to 0", () => {
    expect(parseR1C1("R1C1")).toBe(0);
  });

  it("parses R9C9 to 80", () => {
    expect(parseR1C1("R9C9")).toBe(80);
  });

  it("parses R5C5 to 40", () => {
    expect(parseR1C1("R5C5")).toBe(40);
  });

  it("returns null for invalid format", () => {
    expect(parseR1C1("")).toBeNull();
    expect(parseR1C1("A1")).toBeNull();
  });
});

describe("findCageConflicts", () => {
  it("finds no conflicts when cage sum matches", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    cells[1].value = 3;
    const conflicts = findCageConflicts(cells, [{ cells: [0, 1], sum: 8 }]);
    expect(conflicts.size).toBe(0);
  });

  it("finds conflicts when cage sum does not match", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    cells[1].value = 3;
    const conflicts = findCageConflicts(cells, [{ cells: [0, 1], sum: 10 }]);
    expect(conflicts.size).toBe(2);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(1)).toBe(true);
  });

  it("finds conflicts for duplicate within cage", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    cells[1].value = 5;
    const conflicts = findCageConflicts(cells, [{ cells: [0, 1], sum: 10 }]);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(1)).toBe(true);
  });

  it("ignores empty cells in sum check", () => {
    const cells = Array.from({ length: 81 }, () => EMPTY_CELL());
    cells[0].value = 5;
    const conflicts = findCageConflicts(cells, [{ cells: [0, 1], sum: 8 }]);
    expect(conflicts.size).toBe(0);
  });
});

describe("deepCloneCells", () => {
  it("creates independent copy", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    const clone = deepCloneCells(cells);
    clone[0].value = 9;
    expect(cells[0].value).toBe(5);
  });

  it("clones candidates set", () => {
    const cells = puzzleStringToCells(VALID_PUZZLE);
    const withCandidates = allCandidates(cells);
    const emptyIdx = withCandidates.findIndex(
      (c) => !c.value && c.candidates.size > 0
    );
    expect(emptyIdx).not.toBe(-1);
    const clone = deepCloneCells(withCandidates);
    const firstCandidate = Array.from(clone[emptyIdx].candidates)[0];
    clone[emptyIdx].candidates.delete(firstCandidate);
    expect(withCandidates[emptyIdx].candidates.has(firstCandidate)).toBe(true);
  });
});
