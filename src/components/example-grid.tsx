"use client";

import { useState, useMemo, useCallback } from "react";
import { SudokuGrid } from "@/components/sudoku-grid";
import { puzzleStringToCells, allCandidates } from "@/lib/sudoku";
import type { HintHighlights } from "@/lib/types";

interface ExampleGridProps {
  puzzle: string;
  highlights: HintHighlights;
}

export function ExampleGrid({ puzzle, highlights }: ExampleGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const cells = useMemo(() => {
    const base = puzzleStringToCells(puzzle);
    return allCandidates(base);
  }, [puzzle]);

  const onCellClick = useCallback((index: number, _modifiers: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div className="w-full">
      <SudokuGrid
        cells={cells}
        selectedIndex={selectedIndex}
        onCellClick={onCellClick}
        hintHighlights={highlights}
      />
    </div>
  );
}
