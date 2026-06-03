import { ExplanationCommand } from "./commands";
import * as dlx from "./dlx";
import { ImplicationGraph } from "./graph";
import { STRATEGY_ORDER, applyStrategy } from "./strategies/mod";
import { Grid, parseCellName, rcIdx } from "./types";

export interface PipelineResult {
  commands: ExplanationCommand[];
  solvedGrid: Grid;
  isSolved: boolean;
}

export class PipelineController {
  private puzzle: Grid;
  private currentState: Grid;
  private dlxSolution: Grid;
  private commands: ExplanationCommand[] = [];
  private stepLimit = 500;

  constructor(puzzle: Grid) {
    this.puzzle = puzzle.clone();
    this.currentState = puzzle.clone();
    this.dlxSolution = dlx.validateAndSolve(puzzle);
    this.commands = [];
  }

  static withSolution(puzzle: Grid, solution: Grid): PipelineController {
    const c = new PipelineController(puzzle);
    c.dlxSolution = solution;
    return c;
  }

  static fromPuzzleString(s: string): PipelineController {
    const puzzle = Grid.fromString(s);
    return new PipelineController(puzzle);
  }

  run(): PipelineResult {
    let steps = 0;

    while (!this.currentState.isSolved() && steps < this.stepLimit) {
      const graph = new ImplicationGraph(this.currentState);
      let commandApplied = false;

      for (const strategy of STRATEGY_ORDER) {
        const cmd = applyStrategy(strategy, this.currentState, graph, this.dlxSolution);
        if (cmd) {
          const oldState = this.currentState.clone();
          this.applyCommand(cmd);

          if (!this.gridsEqual(this.currentState, oldState)) {
            this.commands.push(cmd);
            commandApplied = true;
            break;
          }
        }
      }

      if (!commandApplied) {
        throw new Error("Pipeline stalled: no strategy could make progress.");
      }
      steps++;
    }

    if (!this.currentState.isSolved()) {
      throw new Error("Pipeline exceeded step limit without solving.");
    }

    return {
      commands: [...this.commands],
      solvedGrid: this.currentState.clone(),
      isSolved: true,
    };
  }

  private applyCommand(cmd: ExplanationCommand): void {
    for (const mutation of cmd.mutations) {
      const cellIdx = parseCellName(mutation.cell);
      switch (mutation.action) {
        case "SET_VALUE":
          this.currentState.setValue(cellIdx, mutation.digit);
          break;
        case "REMOVE_PENCIL_MARK":
          this.currentState.eliminate(cellIdx, mutation.digit);
          break;
      }
    }
  }

  private gridsEqual(a: Grid, b: Grid): boolean {
    for (let i = 0; i < 81; i++) {
      if (a.cells[i] !== b.cells[i]) return false;
    }
    return true;
  }
}

export function solveAndExplain(puzzleStr: string): PipelineResult {
  const controller = PipelineController.fromPuzzleString(puzzleStr);
  return controller.run();
}
