import { ExplanationCommand } from "../commands";
import { ImplicationGraph, vertexIdx, reconstructChainCommands, vertexCell, vertexDigit } from "../graph";
import { Grid, digitToBit, cellName } from "../types";

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0F0F0F0F;
  return (x * 0x01010101) >>> 24;
}

export function apply(grid: Grid, dlxSolution: Grid | null): ExplanationCommand | null {
  if (!dlxSolution) return null;

  let bestCell: number | null = null;
  let bestCount = 10;

  for (let cell = 0; cell < 81; cell++) {
    if (grid.value(cell) === null) {
      const mask = grid.candidates(cell);
      const cnt = popcount(mask);
      if (cnt > 1 && cnt < bestCount) {
        bestCount = cnt;
        bestCell = cell;
      }
    }
  }

  if (bestCell === null) return null;
  const targetCell = bestCell;
  const correctDigit = dlxSolution.value(targetCell);
  if (correctDigit === null) return null;

  const mask = grid.candidates(targetCell);
  let wrongDigit: number | null = null;
  for (let d = 1; d <= 9; d++) {
    if ((mask & digitToBit(d)) !== 0 && d !== correctDigit) {
      wrongDigit = d;
      break;
    }
  }
  if (wrongDigit === null) return null;

  const graph = new ImplicationGraph(grid);
  const startV = vertexIdx(targetCell, wrongDigit);
  const result = graph.propagateFrom(startV, true);

  if (result.contradiction) {
    const chain = graph.traceChain(startV, result);
    const contradictionCell = vertexCell(result.contradiction.vertex);
    const contradictionDigit = vertexDigit(result.contradiction.vertex);

    let cmd = new ExplanationCommand("DLX Contradiction Chain")
      .withFallback()
      .withDescription(
        `All logical strategies exhausted. Peeking at the cached DLX solution reveals ` +
        `that cell ${cellName(targetCell)} should be ${correctDigit}. By assuming the wrong candidate ` +
        `${cellName(targetCell)}=${wrongDigit} (TRUE), a contradiction is reached at ` +
        `${cellName(contradictionCell)}=${contradictionDigit}, proving the assumption false. ` +
        `Therefore ${correctDigit} is placed in ${cellName(targetCell)}.`
      );

    cmd.logicalProofChain = reconstructChainCommands(chain, graph);
    cmd = cmd.withEliminate(targetCell, wrongDigit);
    cmd = cmd.withSetValue(targetCell, correctDigit);
    return cmd;
  }

  let cmd = new ExplanationCommand("DLX Direct Assignment")
    .withFallback()
    .withDescription(
      `All logical strategies exhausted. Using cached DLX solution to assign ${correctDigit} to ${cellName(targetCell)}.`
    );

  cmd = cmd.withSetValue(targetCell, correctDigit);
  return cmd;
}
