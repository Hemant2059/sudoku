import { describe, it, expect } from "vitest";
import {
  STRATEGIES,
  STRATEGY_LIST,
  getStrategyInfo,
} from "../strategies";

describe("STRATEGIES", () => {
  it("contains all 13 strategies", () => {
    const keys = Object.keys(STRATEGIES);
    expect(keys).toHaveLength(13);
  });

  it("each strategy has required fields", () => {
    for (const [key, s] of Object.entries(STRATEGIES)) {
      expect(s.name).toBeTruthy();
      expect(s.tier).toBeTruthy();
      expect(s.difficulty).toBeGreaterThanOrEqual(1);
      expect(s.difficulty).toBeLessThanOrEqual(6);
      expect(s.description).toBeTruthy();
      expect(s.howItWorks).toBeTruthy();
      expect(s.examplePuzzle).toHaveLength(81);
      expect(Array.isArray(s.exampleHighlights.green)).toBe(true);
      expect(Array.isArray(s.exampleHighlights.red)).toBe(true);
      expect(Array.isArray(s.exampleHighlights.eliminations)).toBe(true);
    }
  });

  it("has valid example puzzles (81 chars, . or 0 or 1-9)", () => {
    for (const s of Object.values(STRATEGIES)) {
      expect(s.examplePuzzle).toHaveLength(81);
      for (const ch of s.examplePuzzle) {
        expect(ch === "." || ch === "0" || (ch >= "1" && ch <= "9")).toBe(true);
      }
    }
  });

  it("has green cells within 0-80 range", () => {
    for (const s of Object.values(STRATEGIES)) {
      for (const idx of s.exampleHighlights.green) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(81);
      }
    }
  });

  it("has red cells within 0-80 range", () => {
    for (const s of Object.values(STRATEGIES)) {
      for (const idx of s.exampleHighlights.red) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(81);
      }
    }
  });

  it("has eliminations within 0-80 range and digits 1-9", () => {
    for (const s of Object.values(STRATEGIES)) {
      for (const e of s.exampleHighlights.eliminations) {
        expect(e.cellIndex).toBeGreaterThanOrEqual(0);
        expect(e.cellIndex).toBeLessThan(81);
        expect(e.digit).toBeGreaterThanOrEqual(1);
        expect(e.digit).toBeLessThanOrEqual(9);
      }
    }
  });
});

describe("STRATEGY_LIST", () => {
  it("is sorted by difficulty ascending", () => {
    for (let i = 1; i < STRATEGY_LIST.length; i++) {
      expect(STRATEGY_LIST[i].difficulty).toBeGreaterThanOrEqual(
        STRATEGY_LIST[i - 1].difficulty
      );
    }
  });
});

describe("getStrategyInfo", () => {
  it("finds Naked Single by key", () => {
    const info = getStrategyInfo("NAKED_SINGLE");
    expect(info.name).toBe("Naked Single");
  });

  it("returns fallback for unknown strategy", () => {
    const info = getStrategyInfo("UNKNOWN_STRATEGY");
    expect(info.description).toBe("No description available for this strategy.");
  });
});
