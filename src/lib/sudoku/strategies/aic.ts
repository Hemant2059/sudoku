import { ExplanationCommand } from "../commands";
import { ImplicationGraph, REGULAR_VERTEX_COUNT, vertexCell, vertexDigit, reconstructChainCommands } from "../graph";
import { Grid } from "../types";
import { classifyAicChain } from "./classifier";

function countChainLength(start: number, result: { contradiction: { vertex: number } | null; predecessor: ({ from: number } | null)[] }): number {
  if (!result.contradiction) return 0;
  let count = 0;
  let current = result.contradiction.vertex;
  while (true) {
    const edge = result.predecessor[current];
    if (!edge) break;
    count++;
    current = edge.from;
    if (current === start) { count++; break; }
  }
  return count;
}

function findBestContradiction(
  grid: Grid, graph: ImplicationGraph
): { startVertex: number; result: ReturnType<ImplicationGraph["propagateFrom"]> } | null {
  let best: { startVertex: number; result: ReturnType<ImplicationGraph["propagateFrom"]>; chainLen: number } | null = null;

  for (let cell = 0; cell < 81; cell++) {
    const mask = grid.cells[cell];
    if (mask === 0 || (mask & (mask - 1)) !== 0) {
      for (let d = 0; d < 9; d++) {
        if (mask & (1 << d)) {
          const v = cell * 9 + d;
          const result = graph.propagateFrom(v, true);
          if (result.contradiction) {
            const chainLen = countChainLength(v, result);
            if (!best || chainLen < best.chainLen) {
              best = { startVertex: v, result, chainLen };
            }
          }
        }
      }
    }
  }

  return best ? { startVertex: best.startVertex, result: best.result } : null;
}

export function apply(grid: Grid, graph: ImplicationGraph): ExplanationCommand | null {
  const best = findBestContradiction(grid, graph);
  if (!best || !best.result.contradiction) return null;

  const { startVertex, result } = best;
  const chain = graph.traceChain(startVertex, result);

  const startCell = startVertex < REGULAR_VERTEX_COUNT ? vertexCell(startVertex) : 0;
  const startDigit = startVertex < REGULAR_VERTEX_COUNT ? vertexDigit(startVertex) : 1;

  const classified = classifyAicChain(chain, grid);

  const cmd = new ExplanationCommand(classified.name)
    .withDescription(classified.description)
    .withFallback();

  cmd.logicalProofChain = reconstructChainCommands(chain, graph);

  if (startVertex < REGULAR_VERTEX_COUNT) {
    cmd.withEliminate(startCell, startDigit);
  }

  return cmd;
}
