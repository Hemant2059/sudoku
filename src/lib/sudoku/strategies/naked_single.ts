import { ExplanationCommand } from "../commands";
import { Grid, bitToDigit, cellName } from "../types";

export function apply(grid: Grid): ExplanationCommand | null {
  for (let cellIdx = 0; cellIdx < 81; cellIdx++) {
    if (grid.value(cellIdx) !== null) continue;
    const mask = grid.cells[cellIdx];
    if (mask !== 0 && (mask & (mask - 1)) === 0) {
      const digit = bitToDigit(mask)!;
      return new ExplanationCommand("Naked Single")
        .withDescription(`Cell ${cellName(cellIdx)} has only one candidate: ${digit}. It must be placed.`)
        .withSetValue(cellIdx, digit)
        .withProofStep(cellIdx, digit, "MUST_BE");
    }
  }
  return null;
}
