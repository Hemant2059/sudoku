import { ExplanationCommand } from "../commands";
import { Grid, cellRow, cellCol, rowCells, colCells, boxCells, digitToBit, type CellIdx } from "../types";

export function apply(grid: Grid): ExplanationCommand | null {
  for (let box = 0; box < 9; box++) {
    const bCells = boxCells(box);
    for (let digit = 1; digit <= 9; digit++) {
      const dBit = digitToBit(digit);
      const candidatesInBox = bCells.filter(c => (grid.candidates(c) & dBit) !== 0);

      if (candidatesInBox.length === 0 || candidatesInBox.length > 3) continue;

      const rows = new Set(candidatesInBox.map(c => cellRow(c)));
      const cols = new Set(candidatesInBox.map(c => cellCol(c)));

      if (rows.size === 1) {
        const row = [...rows][0];
        let cmd: ExplanationCommand | null = null;
        for (const c of rowCells(row)) {
          if (candidatesInBox.includes(c)) continue;
          if ((grid.candidates(c) & dBit) !== 0) {
            if (cmd === null) {
              cmd = new ExplanationCommand("Pointing Pair")
                .withDescription(
                  `Digit ${digit} in box ${box + 1} is locked to row ${row + 1}. ` +
                  `It can be eliminated from other cells in that row.`
                );
            }
            cmd = cmd.withEliminate(c, digit).withProofStep(c, digit, "CANNOT_BE");
          }
        }
        if (cmd) return cmd;
      }

      if (cols.size === 1) {
        const col = [...cols][0];
        let cmd: ExplanationCommand | null = null;
        for (const c of colCells(col)) {
          if (candidatesInBox.includes(c)) continue;
          if ((grid.candidates(c) & dBit) !== 0) {
            if (cmd === null) {
              cmd = new ExplanationCommand("Pointing Pair")
                .withDescription(
                  `Digit ${digit} in box ${box + 1} is locked to column ${col + 1}. ` +
                  `It can be eliminated from other cells in that column.`
                );
            }
            cmd = cmd.withEliminate(c, digit).withProofStep(c, digit, "CANNOT_BE");
          }
        }
        if (cmd) return cmd;
      }
    }
  }
  return null;
}
