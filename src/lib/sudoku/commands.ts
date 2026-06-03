export interface UIHighlight {
  cell: string;
  digit: number;
}

export interface ProofStep {
  cell: string;
  digit: number;
  state: string;
}

export interface Mutation {
  cell: string;
  action: string;
  digit: number;
}

export interface UIHighlights {
  greenCells: string[];
  redCells: string[];
  eliminationCandidates: UIHighlight[];
}

export class ExplanationCommand {
  strategyName: string;
  isFallbackUsed: boolean;
  description: string;
  uiHighlights: UIHighlights;
  logicalProofChain: ProofStep[];
  mutations: Mutation[];

  constructor(strategyName: string) {
    this.strategyName = strategyName;
    this.isFallbackUsed = false;
    this.description = "";
    this.uiHighlights = { greenCells: [], redCells: [], eliminationCandidates: [] };
    this.logicalProofChain = [];
    this.mutations = [];
  }

  withSetValue(idx: number, digit: number): this {
    const cell = `R${Math.floor(idx / 9) + 1}C${(idx % 9) + 1}`;
    this.mutations.push({ cell, action: "SET_VALUE", digit });
    this.uiHighlights.greenCells.push(cell);
    return this;
  }

  withEliminate(idx: number, digit: number): this {
    const cell = `R${Math.floor(idx / 9) + 1}C${(idx % 9) + 1}`;
    this.mutations.push({ cell, action: "REMOVE_PENCIL_MARK", digit });
    this.uiHighlights.redCells.push(cell);
    this.uiHighlights.eliminationCandidates.push({ cell, digit });
    return this;
  }

  withDescription(desc: string): this {
    this.description = desc;
    return this;
  }

  withProofStep(idx: number, digit: number, state: string): this {
    const cell = `R${Math.floor(idx / 9) + 1}C${(idx % 9) + 1}`;
    this.logicalProofChain.push({ cell, digit, state });
    return this;
  }

  withFallback(): this {
    this.isFallbackUsed = true;
    return this;
  }
}
