import { ExplanationCommand } from "../commands";
import { Grid, cellName, rowCells, colCells, boxCells, digitToBit, type CellIdx, type CandidateMask } from "../types";

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0F0F0F0F;
  return (x * 0x01010101) >>> 24;
}

export function apply(grid: Grid): ExplanationCommand | null {
  for (let unitType = 0; unitType < 27; unitType++) {
    let unitCells: CellIdx[];
    if (unitType < 9) unitCells = rowCells(unitType);
    else if (unitType < 18) unitCells = colCells(unitType - 9);
    else unitCells = boxCells(unitType - 18);

    const unsolved: [CellIdx, CandidateMask][] = unitCells
      .filter(c => grid.value(c) === null)
      .map(c => [c, grid.candidates(c)]);

    if (unsolved.length < 2) continue;

    for (let subsetSize = 2; subsetSize <= 3; subsetSize++) {
      if (unsolved.length < subsetSize) continue;
      const n = unsolved.length;
      const indices = Array.from({ length: subsetSize }, (_, i) => i);

      while (true) {
        const subsetCells = indices.map(i => unsolved[i]);
        let unionMask = 0;
        for (const [, mask] of subsetCells) unionMask |= mask;

        if (popcount(unionMask) === subsetSize) {
          let cmd: ExplanationCommand | null = null;
          for (const cell of unitCells) {
            if (subsetCells.some(([sc]) => sc === cell)) continue;
            for (let d = 1; d <= 9; d++) {
              const dBit = digitToBit(d);
              if ((unionMask & dBit) !== 0 && grid.isCandidate(cell, d)) {
                if (cmd === null) {
                  const digitNames: string[] = [];
                  for (let dd = 1; dd <= 9; dd++) {
                    if (unionMask & digitToBit(dd)) digitNames.push(String(dd));
                  }
                  const cellNames = subsetCells.map(([sc]) => cellName(sc));
                  cmd = new ExplanationCommand("Naked Subset")
                    .withDescription(
                      `Naked ${subsetSize} in cells ${cellNames.join(", ")} form a subset of digits ${digitNames.join(", ")}. ` +
                      `These digits can be eliminated from other cells in the unit.`
                    );
                }
                cmd = cmd.withEliminate(cell, d).withProofStep(cell, d, "CANNOT_BE");
              }
            }
          }
          if (cmd) return cmd;
        }

        let i = subsetSize - 1;
        while (i >= 0 && indices[i] >= n - subsetSize + i) i--;
        if (i < 0) break;
        indices[i]++;
        for (let j = i + 1; j < subsetSize; j++) {
          indices[j] = indices[j - 1] + 1;
        }
        if (indices[subsetSize - 1] >= n) break;
      }
    }
  }
  return null;
}
