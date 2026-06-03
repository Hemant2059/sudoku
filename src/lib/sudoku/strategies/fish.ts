import { ExplanationCommand } from "../commands";
import { Grid, rcIdx, digitToBit } from "../types";

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0F0F0F0F;
  return (x * 0x01010101) >>> 24;
}

export function findFishPatterns(grid: Grid, dimension: number): ExplanationCommand | null {
  for (let digit = 1; digit <= 9; digit++) {
    const r1 = findFishInOrientation(grid, digit, dimension, true);
    if (r1) return r1;
    const r2 = findFishInOrientation(grid, digit, dimension, false);
    if (r2) return r2;
  }
  return null;
}

function findFishInOrientation(
  grid: Grid, digit: number, dimension: number, rowMajor: boolean
): ExplanationCommand | null {
  const dBit = digitToBit(digit);
  const baseMasks: number[] = new Array(9).fill(0);

  if (rowMajor) {
    for (let r = 0; r < 9; r++) {
      let mask = 0;
      for (let c = 0; c < 9; c++) {
        if ((grid.candidates(rcIdx(r, c)) & dBit) !== 0) mask |= 1 << c;
      }
      baseMasks[r] = mask;
    }
  } else {
    for (let c = 0; c < 9; c++) {
      let mask = 0;
      for (let r = 0; r < 9; r++) {
        if ((grid.candidates(rcIdx(r, c)) & dBit) !== 0) mask |= 1 << r;
      }
      baseMasks[c] = mask;
    }
  }

  const candidateBases: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const cnt = popcount(baseMasks[i]);
    if (cnt >= 2 && cnt <= dimension) candidateBases.push([i, baseMasks[i]]);
  }

  const n = candidateBases.length;
  if (n < dimension) return null;

  const fishName = dimension === 4 ? "JELLYFISH" : dimension === 3 ? "SWORDFISH" : "X-WING";

  function tryCombinations(
    start: number, depth: number, combination: [number, number][]
  ): ExplanationCommand | null {
    if (depth === dimension) {
      let unionMask = 0;
      for (const [, mask] of combination) unionMask |= mask;
      if (popcount(unionMask) === dimension) {
        const coverIndices: number[] = [];
        for (let i = 0; i < 9; i++) {
          if (unionMask & (1 << i)) coverIndices.push(i);
        }
        const baseIndices = combination.map(([idx]) => idx);
        let cmd: ExplanationCommand | null = null;

        for (const coverIdx of coverIndices) {
          for (let baseCandidate = 0; baseCandidate < 9; baseCandidate++) {
            if (baseIndices.includes(baseCandidate)) continue;
            const [targetRow, targetCol] = rowMajor ? [baseCandidate, coverIdx] : [coverIdx, baseCandidate];
            const idx = rcIdx(targetRow, targetCol);
            if ((grid.candidates(idx) & digitToBit(digit)) !== 0) {
              if (cmd === null) {
                const baseNames = baseIndices.map(i => rowMajor ? `Row ${i + 1}` : `Col ${i + 1}`);
                const coverNames = coverIndices.map(i => rowMajor ? `Col ${i + 1}` : `Row ${i + 1}`);
                cmd = new ExplanationCommand(fishName)
                  .withDescription(
                    `${fishName}: digit ${digit} is confined to ${coverNames.join(", ")} in ${baseNames.join(", ")} ` +
                    `forming a ${dimension}-dimensional fish. Eliminate from other cells in the cover sets.`
                  );
              }
              cmd = cmd!.withEliminate(idx, digit).withProofStep(idx, digit, "CANNOT_BE");
            }
          }
        }
        return cmd;
      }
      return null;
    }

    for (let i = start; i <= n - (dimension - depth); i++) {
      combination.push(candidateBases[i]);
      const r = tryCombinations(i + 1, depth + 1, combination);
      if (r) return r;
      combination.pop();
    }
    return null;
  }

  return tryCombinations(0, 0, []);
}
