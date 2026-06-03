import { ExplanationCommand } from "../commands";
import { Grid, rowCells, colCells, boxCells, cellName, type CellIdx } from "../types";

export function apply(grid: Grid): ExplanationCommand | null {
  for (let unitType = 0; unitType < 27; unitType++) {
    let unitCells: CellIdx[];
    if (unitType < 9) unitCells = rowCells(unitType);
    else if (unitType < 18) unitCells = colCells(unitType - 9);
    else unitCells = boxCells(unitType - 18);

    for (let digit = 1; digit <= 9; digit++) {
      let count = 0;
      let lastCell = 0;
      for (const c of unitCells) {
        if (grid.isCandidate(c, digit)) {
          count++;
          lastCell = c;
          if (count > 1) break;
        }
      }
      if (count === 1 && grid.value(lastCell) === null) {
        const unitName = unitType < 9
          ? `Row ${unitType + 1}`
          : unitType < 18
            ? `Column ${unitType - 9 + 1}`
            : `Box ${unitType - 18 + 1}`;

        let cmd = new ExplanationCommand("Hidden Single")
          .withDescription(
            `In ${unitName}, digit ${digit} appears only in cell ${cellName(lastCell)}. It must be placed there.`)
          .withSetValue(lastCell, digit)
          .withProofStep(lastCell, digit, "MUST_BE");

        for (const c of unitCells) {
          if (c !== lastCell && grid.isCandidate(c, digit)) {
            cmd = cmd.withEliminate(c, digit);
          }
        }
        return cmd;
      }
    }
  }
  return null;
}
