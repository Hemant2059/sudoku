import { ExplanationCommand } from "../commands";
import { ImplicationGraph, vertexIdx, REGULAR_VERTEX_COUNT, vertexCell } from "../graph";
import { Grid, cellName, type CellIdx } from "../types";

export function apply(grid: Grid, graph: ImplicationGraph): ExplanationCommand | null {
  const bivalueCells: CellIdx[] = [];
  for (let c = 0; c < 81; c++) {
    if (popcount(grid.cells[c]) === 2) bivalueCells.push(c);
  }

  for (const cell of bivalueCells) {
    const mask = grid.cells[cell];
    const bits: number[] = [];
    for (let d = 0; d < 9; d++) {
      if (mask & (1 << d)) bits.push(d + 1);
    }
    const dA = bits[0];
    const dB = bits[1];
    const vA = vertexIdx(cell, dA);
    const vB = vertexIdx(cell, dB);

    const resultA = graph.propagateFrom(vA, true);
    const resultB = graph.propagateFrom(vB, true);
    const elimA = resultA.contradiction !== null;
    const elimB = resultB.contradiction !== null;

    if (elimA && !elimB) {
      const chain = graph.traceChain(vA, resultA);
      const cellNames = chain
        .filter(([v]) => v < REGULAR_VERTEX_COUNT)
        .map(([v]) => cellName(vertexCell(v)));
      return new ExplanationCommand("Forcing Chain")
        .withDescription(
          `Forcing Chain: Cell ${cellName(cell)} (digits ${dA}/${dB}) — ` +
          `assuming ${dA} leads to contradiction, so ${cellName(cell)} must be ${dB}. Chain: ${cellNames.join(" → ")}`
        )
        .withSetValue(cell, dB)
        .withFallback();
    }

    if (!elimA && elimB) {
      const chain = graph.traceChain(vB, resultB);
      const cellNames = chain
        .filter(([v]) => v < REGULAR_VERTEX_COUNT)
        .map(([v]) => cellName(vertexCell(v)));
      return new ExplanationCommand("Forcing Chain")
        .withDescription(
          `Forcing Chain: Cell ${cellName(cell)} (digits ${dA}/${dB}) — ` +
          `assuming ${dB} leads to contradiction, so ${cellName(cell)} must be ${dA}. Chain: ${cellNames.join(" → ")}`
        )
        .withSetValue(cell, dA)
        .withFallback();
    }
  }

  return null;
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0F0F0F0F;
  return (x * 0x01010101) >>> 24;
}
