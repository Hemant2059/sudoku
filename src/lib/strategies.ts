export interface StrategyInfo {
  name: string;
  tier: string;
  difficulty: number;
  description: string;
  howItWorks: string;
  example: string;
  examplePuzzle: string;
  exampleHighlights: { green: number[]; red: number[]; eliminations: { cellIndex: number; digit: number }[] };
  exampleNote: string;
}

function rc(r: number, c: number): number {
  return (r - 1) * 9 + (c - 1);
}

export const STRATEGIES: Record<string, StrategyInfo> = {
  "NAKED_SINGLE": {
    name: "Naked Single",
    tier: "EASY",
    difficulty: 1,
    description: "A cell has only one possible candidate remaining. The digit must go there.",
    howItWorks:
      "After pencil-marking all candidates, scan for cells where only a single candidate remains. Since all other digits are eliminated by peers in the same row, column, or box, that one remaining candidate is the only valid digit for the cell.",
    example:
      "Cell R7C3 sees 1,2,4,5 in its row, 3,6,7 in its column, and 8 in its box — eliminating everything except 9. With only {9} remaining, 9 must be placed in R7C3.",
    examplePuzzle:
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    exampleHighlights: {
      green: [rc(7, 3)],
      red: [],
      eliminations: [],
    },
    exampleNote: "R7C3 has only one candidate (9) remaining — all other digits are eliminated by peers in row 7, column 3, and box 7.",
  },
  "HIDDEN_SINGLE": {
    name: "Hidden Single",
    tier: "EASY",
    difficulty: 1,
    description: "A digit appears in only one cell within a row, column, or box.",
    howItWorks:
      "Look within a single row, column, or 3×3 box. If a particular digit (1-9) can only go in exactly one cell of that unit, then that cell must contain that digit, even if the cell has other candidates.",
    example:
      "In Row 2, digit 3 appears as a candidate only in cell R2C7. Even if R2C7 has other candidates, 3 must go there because no other cell in row 2 can hold 3.",
    examplePuzzle:
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    exampleHighlights: {
      green: [rc(2, 7)],
      red: [],
      eliminations: [],
    },
    exampleNote: "Digit 3 in Row 2 can only go in R2C7 — no other cell in row 2 has room for 3.",
  },
  "NAKED_SUBSET": {
    name: "Naked Subset (Pair / Triple / Quad)",
    tier: "MEDIUM",
    difficulty: 2,
    description: "N cells in a unit share the same N candidates, allowing those candidates to be removed from all other cells in the unit.",
    howItWorks:
      "If N cells within the same row, column, or box contain exactly the same N candidates (and no others), then those candidates can be eliminated from all other cells in that unit. These candidates cannot appear elsewhere because they must occupy those N cells.",
    example:
      "Cells R7C1 and R7C3 in row 7 both have candidates {2, 6}. No other cell in row 7 has exactly {2, 6}, so 2 and 6 can be eliminated from all other cells in row 7.",
    examplePuzzle:
      "2.........6...................2...................6....1.345789.......6.........2",
    exampleHighlights: {
      green: [rc(7, 1), rc(7, 3)],
      red: [rc(7, 2), rc(7, 4), rc(7, 5), rc(7, 6), rc(7, 7), rc(7, 8), rc(7, 9)],
      eliminations: [
        { cellIndex: rc(7, 2), digit: 2 }, { cellIndex: rc(7, 2), digit: 6 },
        { cellIndex: rc(7, 4), digit: 2 }, { cellIndex: rc(7, 4), digit: 6 },
        { cellIndex: rc(7, 5), digit: 2 }, { cellIndex: rc(7, 5), digit: 6 },
        { cellIndex: rc(7, 6), digit: 2 }, { cellIndex: rc(7, 6), digit: 6 },
        { cellIndex: rc(7, 7), digit: 2 }, { cellIndex: rc(7, 7), digit: 6 },
        { cellIndex: rc(7, 8), digit: 2 }, { cellIndex: rc(7, 8), digit: 6 },
        { cellIndex: rc(7, 9), digit: 2 }, { cellIndex: rc(7, 9), digit: 6 },
      ],
    },
    exampleNote: "R7C1 and R7C3 both have {2, 6}. Since those two cells must hold 2 and 6, eliminate 2 and 6 from all other cells in row 7.",
  },
  "POINTING_PAIR": {
    name: "Pointing Pair / Triple",
    tier: "MEDIUM",
    difficulty: 2,
    description: "A candidate is restricted to one row or column within a box, allowing elimination from the rest of that row or column.",
    howItWorks:
      "Within a 3×3 box, if all occurrences of a candidate are confined to a single row (or column), then that candidate can be eliminated from that same row (or column) outside the box.",
    example:
      "In Box 1, digit 7 only appears as a candidate in R1C1 and R3C1 (both in column 1). Since 7 must be in column 1 within box 1, it can be eliminated from all other cells in column 1 outside box 1.",
    examplePuzzle:
      "712......345.......68............................................................",
    exampleHighlights: {
      green: [rc(1, 1), rc(3, 1)],
      red: [rc(4, 1), rc(5, 1), rc(6, 1), rc(7, 1), rc(8, 1), rc(9, 1)],
      eliminations: [
        { cellIndex: rc(4, 1), digit: 7 }, { cellIndex: rc(5, 1), digit: 7 },
        { cellIndex: rc(6, 1), digit: 7 }, { cellIndex: rc(7, 1), digit: 7 },
        { cellIndex: rc(8, 1), digit: 7 }, { cellIndex: rc(9, 1), digit: 7 },
      ],
    },
    exampleNote: "Digit 7 in Box 1 only appears in column 1 (R1C1, R3C1). Eliminate 7 from all other cells in column 1.",
  },
  "X_WING": {
    name: "X-Wing",
    tier: "HARD",
    difficulty: 3,
    description: "A digit appears in exactly two rows in two columns, forming a rectangle. This allows elimination from other rows/columns.",
    howItWorks:
      "Find a digit that appears in exactly two rows, and within those two rows it only appears in the same two columns. The digit must go in one of the two cells in each row, creating a diagonal pair. This means the digit cannot appear in those two columns outside those two rows.",
    example:
      "Digit 9 appears only in columns 2 and 5 within rows 1 and 6. The digit 9 can be eliminated from all other cells in columns 2 and 5 outside rows 1 and 6.",
    examplePuzzle:
      "1.23.45676.7........3......4.5......7........8.91.23459.1......3.4......5.6......",
    exampleHighlights: {
      green: [rc(1, 2), rc(1, 5), rc(6, 2), rc(6, 5)],
      red: [rc(2, 2), rc(3, 2), rc(4, 2), rc(5, 2), rc(7, 2), rc(8, 2), rc(9, 2),
            rc(2, 5), rc(3, 5), rc(4, 5), rc(5, 5), rc(7, 5), rc(8, 5), rc(9, 5)],
      eliminations: [
        { cellIndex: rc(2, 2), digit: 9 }, { cellIndex: rc(3, 2), digit: 9 },
        { cellIndex: rc(4, 2), digit: 9 }, { cellIndex: rc(5, 2), digit: 9 },
        { cellIndex: rc(7, 2), digit: 9 }, { cellIndex: rc(8, 2), digit: 9 }, { cellIndex: rc(9, 2), digit: 9 },
        { cellIndex: rc(2, 5), digit: 9 }, { cellIndex: rc(3, 5), digit: 9 },
        { cellIndex: rc(4, 5), digit: 9 }, { cellIndex: rc(5, 5), digit: 9 },
        { cellIndex: rc(7, 5), digit: 9 }, { cellIndex: rc(8, 5), digit: 9 }, { cellIndex: rc(9, 5), digit: 9 },
      ],
    },
    exampleNote: "Digit 9 in rows 1 and 6 only appears in columns 2 and 5 — an X-Wing pattern. Eliminate 9 from all other cells in columns 2 and 5.",
  },
  "SWORDFISH": {
    name: "Swordfish",
    tier: "EXPERT",
    difficulty: 4,
    description: "An X-Wing extended to three rows and three columns.",
    howItWorks:
      "A digit appears in exactly three rows, and within those rows it is confined to the same three columns. The digit can then be eliminated from those three columns outside those three rows.",
    example:
      "Digit 2 appears only in columns 1, 4, and 7 within rows 2, 5, and 8. The digit 2 can be eliminated from all other cells in columns 1, 4, and 7 outside rows 2, 5, and 8.",
    examplePuzzle:
      "..........13.45.67...................89.13.45...................67.89.13.........",
    exampleHighlights: {
      green: [rc(2, 1), rc(2, 4), rc(2, 7), rc(5, 1), rc(5, 4), rc(5, 7), rc(8, 1), rc(8, 4), rc(8, 7)],
      red: [
        rc(1, 1), rc(3, 1), rc(4, 1), rc(6, 1), rc(7, 1), rc(9, 1),
        rc(1, 4), rc(3, 4), rc(4, 4), rc(6, 4), rc(7, 4), rc(9, 4),
        rc(1, 7), rc(3, 7), rc(4, 7), rc(6, 7), rc(7, 7), rc(9, 7),
      ],
      eliminations: [
        { cellIndex: rc(1, 1), digit: 2 }, { cellIndex: rc(3, 1), digit: 2 },
        { cellIndex: rc(4, 1), digit: 2 }, { cellIndex: rc(6, 1), digit: 2 },
        { cellIndex: rc(7, 1), digit: 2 }, { cellIndex: rc(9, 1), digit: 2 },
        { cellIndex: rc(1, 4), digit: 2 }, { cellIndex: rc(3, 4), digit: 2 },
        { cellIndex: rc(4, 4), digit: 2 }, { cellIndex: rc(6, 4), digit: 2 },
        { cellIndex: rc(7, 4), digit: 2 }, { cellIndex: rc(9, 4), digit: 2 },
        { cellIndex: rc(1, 7), digit: 2 }, { cellIndex: rc(3, 7), digit: 2 },
        { cellIndex: rc(4, 7), digit: 2 }, { cellIndex: rc(6, 7), digit: 2 },
        { cellIndex: rc(7, 7), digit: 2 }, { cellIndex: rc(9, 7), digit: 2 },
      ],
    },
    exampleNote: "Digit 2 in rows 2, 5, and 8 is confined to columns 1, 4, and 7 — a Swordfish. Eliminate 2 from those columns in all other rows.",
  },
  "JELLYFISH": {
    name: "Jellyfish",
    tier: "MASTER",
    difficulty: 5,
    description: "A 4×4 extension of the X-Wing pattern, involving four rows and four columns.",
    howItWorks:
      "A digit appears in exactly four rows, and within those rows it is confined to the same four columns. The digit can be eliminated from those four columns outside those four rows.",
    example:
      "Digit 3 appears only in columns 2, 3, 5, and 8 within rows 1, 4, 7, and 9. The digit 3 can be eliminated from all other cells in columns 2, 3, 5, and 8 outside rows 1, 4, 7, and 9.",
    examplePuzzle:
      "1.2.4.5.6..................7.8.9.1.2..................4.5.6.7.8.........9.1.2.4.5",
    exampleHighlights: {
      green: [
        rc(1, 2), rc(1, 4), rc(1, 6), rc(1, 8),
        rc(4, 2), rc(4, 4), rc(4, 6), rc(4, 8),
        rc(7, 2), rc(7, 4), rc(7, 6), rc(7, 8),
        rc(9, 2), rc(9, 4), rc(9, 6), rc(9, 8),
      ],
      red: [
        rc(2, 2), rc(3, 2), rc(5, 2), rc(6, 2), rc(8, 2),
        rc(2, 4), rc(3, 4), rc(5, 4), rc(6, 4), rc(8, 4),
        rc(2, 6), rc(3, 6), rc(5, 6), rc(6, 6), rc(8, 6),
        rc(2, 8), rc(3, 8), rc(5, 8), rc(6, 8), rc(8, 8),
      ],
      eliminations: [],
    },
    exampleNote: "Digit 3 in rows 1, 4, 7, 9 is confined to columns 2, 4, 6, 8 — a Jellyfish pattern.",
  },
  "Y_WING": {
    name: "Y-Wing",
    tier: "HARD",
    difficulty: 3,
    description: "Three bivalue cells sharing candidates that form a chain, allowing an elimination at the intersection.",
    howItWorks:
      "Find three bivalue cells (cells with exactly two candidates each). The first cell (pivot) shares one candidate with the second cell (pincer 1) via a row/column, and the other candidate with the third cell (pincer 2) via a box. The cell that sees both pincers cannot contain the shared candidate.",
    example:
      "R1C1 {1,5}, R1C5 {1,9}, R5C1 {5,9}. The pivot R1C1 shares 1 with R1C5 and 5 with R5C1. R5C5 sees both R1C5 and R5C1, so it cannot contain 9.",
    examplePuzzle:
      ".234.67896........7........8.....................................................",
    exampleHighlights: {
      green: [rc(1, 1), rc(1, 5), rc(5, 1)],
      red: [rc(5, 5)],
      eliminations: [{ cellIndex: rc(5, 5), digit: 9 }],
    },
    exampleNote: "Pivot R1C1 {1,5}, pincers R1C5 {1,9} and R5C1 {5,9}. R5C5 sees both pincers — cannot be 9.",
  },
  "XY_CHAIN": {
    name: "XY-Chain",
    tier: "EXPERT",
    difficulty: 4,
    description: "A chain of bivalue cells where each adjacent pair shares a candidate, allowing eliminations at both ends.",
    howItWorks:
      "Build a chain of bivalue cells where each consecutive pair shares a common candidate. If the chain length is odd, the cells at both ends share a candidate that can be eliminated from any cell that sees both ends.",
    example:
      "R1C1 {1,2} — R1C5 {2,3} — R3C5 {3,5} — R3C2 {5,1}. The ends R1C1 and R3C2 share candidate 1. Any cell that sees both R1C1 and R3C2 cannot contain 1.",
    examplePuzzle:
      "..46..789...........84..26.......................................................",
    exampleHighlights: {
      green: [rc(1, 1), rc(1, 5), rc(3, 5), rc(3, 2)],
      red: [],
      eliminations: [],
    },
    exampleNote: "Chain: R1C1 {1,2} → R1C5 {2,3} → R3C5 {3,5} → R3C2 {5,1}. The ends share candidate 1 — any cell that sees both R1C1 and R3C2 cannot contain 1.",
  },
  "ALTERNATING_INFERENCE_CHAIN": {
    name: "Alternating Inference Chain (AIC)",
    tier: "MASTER",
    difficulty: 5,
    description: "A chain alternating between strong and weak inferences to prove that a candidate must be true or false.",
    howItWorks:
      "A strong link means 'if A is false then B is true.' A weak link means 'if A is true then B is false.' By chaining strong-weak-strong-weak inferences, if the chain starts and ends with a strong link on the same candidate, that candidate can be placed or eliminated.",
    example:
      "If 5 in R2C4 is strongly linked to 5 in R2C8, weakly linked to 3 in R2C8, strongly linked to 3 in R5C8, weakly linked to 3 in R5C4, and strongly linked to 5 in R5C4, then either R2C4 or R5C4 must be 5, eliminating 5 from all other cells in column 4.",
    examplePuzzle:
      ".........123.467.8..................912.678......................................",
    exampleHighlights: {
      green: [rc(2, 4), rc(2, 8), rc(5, 8), rc(5, 4)],
      red: [rc(1, 4), rc(3, 4), rc(4, 4), rc(6, 4), rc(7, 4), rc(8, 4), rc(9, 4)],
      eliminations: [
        { cellIndex: rc(1, 4), digit: 5 }, { cellIndex: rc(3, 4), digit: 5 },
        { cellIndex: rc(4, 4), digit: 5 }, { cellIndex: rc(6, 4), digit: 5 },
        { cellIndex: rc(7, 4), digit: 5 }, { cellIndex: rc(8, 4), digit: 5 }, { cellIndex: rc(9, 4), digit: 5 },
      ],
    },
    exampleNote: "AIC proves either R2C4 or R5C4 is 5. Eliminate 5 from all other cells in column 4.",
  },
  "FORCING_CHAIN": {
    name: "Forcing Chain",
    tier: "MASTER",
    difficulty: 5,
    description: "A chain that follows the implications of choosing one candidate to prove a contradiction or a forced placement.",
    howItWorks:
      "Temporarily assume a candidate is true and follow the logical consequences. If this assumption leads to a contradiction (a cell with no candidates or a digit appearing twice in a unit), then the assumption is false and the opposite candidate must be true.",
    example:
      "Assume R1C1 = 3. This forces a chain of eliminations that eventually leaves R6C1 with no candidates. Contradiction! Therefore R1C1 cannot be 3.",
    examplePuzzle:
      ".124.....5........6........7........8............................................",
    exampleHighlights: {
      green: [rc(1, 1)],
      red: [rc(6, 1)],
      eliminations: [{ cellIndex: rc(6, 1), digit: 3 }],
    },
    exampleNote: "Assuming 3 at R1C1 leads to a contradiction at R6C1 (no candidates left). Therefore 3 cannot be at R1C1.",
  },
  "DLX_CONTRADICTION_CHAIN": {
    name: "DLX Contradiction Chain",
    tier: "EXTREME",
    difficulty: 6,
    description: "A brute-force chain using the exact-cover algorithm to test candidates when no logical strategy applies.",
    howItWorks:
      "When all logical strategies are exhausted, the algorithm falls back to a DLX (Dancing Links) contradiction search. It selects a candidate, assumes it's true, and checks if the puzzle becomes unsolvable. If it does, that candidate is eliminated.",
    example:
      "After all other strategies are exhausted, the solver picks a bivalue cell R4C6 {2, 8} and tests 2. Running DLX on the grid assuming 2 at R4C6 leads to no solution. Therefore R4C6 cannot be 2, and must be 8.",
    examplePuzzle:
      "...............................7.................................................",
    exampleHighlights: {
      green: [rc(4, 6)],
      red: [],
      eliminations: [{ cellIndex: rc(4, 6), digit: 2 }],
    },
    exampleNote: "DLX tests 2 at R4C6 — no solution found. R4C6 cannot be 2, so it must be 8.",
  },
  "DLX_DIRECT_ASSIGNMENT": {
    name: "DLX Direct Assignment",
    tier: "EXTREME",
    difficulty: 6,
    description: "A direct assignment from the DLX solution when no logical path can be found.",
    howItWorks:
      "The DLX algorithm solves the remaining puzzle directly and the solver assigns the value from that solution.",
    example:
      "After exhausting all logical strategies and contradiction chains, the DLX algorithm finds the unique solution and assigns a value directly from it.",
    examplePuzzle:
      "..................................................................1..............",
    exampleHighlights: {
      green: [rc(9, 1)],
      red: [],
      eliminations: [],
    },
    exampleNote: "When no logical strategy can make progress, DLX solves the puzzle directly and assigns the only valid digit.",
  },
};

export function getStrategyInfo(name: string): StrategyInfo {
  const key = name.toUpperCase().replace(/ /g, "_");
  return STRATEGIES[key] || {
    name,
    tier: "UNKNOWN",
    difficulty: 0,
    description: "No description available for this strategy.",
    howItWorks: "This strategy is not yet documented.",
    example: "",
    examplePuzzle: "",
    exampleHighlights: { green: [], red: [], eliminations: [] },
    exampleNote: "",
  };
}

export const STRATEGY_LIST = Object.values(STRATEGIES).sort((a, b) => a.difficulty - b.difficulty);
