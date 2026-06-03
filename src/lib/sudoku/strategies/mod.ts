import { ExplanationCommand } from "../commands";
import { ImplicationGraph } from "../graph";
import { Grid } from "../types";
import * as nakedSingle from "./naked_single";
import * as hiddenSingle from "./hidden_single";
import * as nakedSubset from "./naked_subset";
import * as pointingPair from "./pointing_pair";
import * as fish from "./fish";
import * as aic from "./aic";
import * as xyChain from "./xy_chain";
import * as dlxFallback from "./dlx_fallback";

export enum StrategyKind {
  NakedSingle,
  HiddenSingle,
  NakedSubset,
  PointingPair,
  Fish2,
  Fish3,
  Fish4,
  Aic,
  ForcingChain,
  DlxFallback,
}

export const STRATEGY_ORDER: StrategyKind[] = [
  StrategyKind.NakedSingle,
  StrategyKind.HiddenSingle,
  StrategyKind.NakedSubset,
  StrategyKind.PointingPair,
  StrategyKind.Fish2,
  StrategyKind.Fish3,
  StrategyKind.Fish4,
  StrategyKind.Aic,
  StrategyKind.ForcingChain,
  StrategyKind.DlxFallback,
];

export function applyStrategy(
  kind: StrategyKind,
  grid: Grid,
  graph: ImplicationGraph,
  dlxSolution: Grid | null
): ExplanationCommand | null {
  switch (kind) {
    case StrategyKind.NakedSingle: return nakedSingle.apply(grid);
    case StrategyKind.HiddenSingle: return hiddenSingle.apply(grid);
    case StrategyKind.NakedSubset: return nakedSubset.apply(grid);
    case StrategyKind.PointingPair: return pointingPair.apply(grid);
    case StrategyKind.Fish2: return fish.findFishPatterns(grid, 2);
    case StrategyKind.Fish3: return fish.findFishPatterns(grid, 3);
    case StrategyKind.Fish4: return fish.findFishPatterns(grid, 4);
    case StrategyKind.Aic: return aic.apply(grid, graph);
    case StrategyKind.ForcingChain: return xyChain.apply(grid, graph);
    case StrategyKind.DlxFallback: return dlxFallback.apply(grid, dlxSolution);
  }
}
