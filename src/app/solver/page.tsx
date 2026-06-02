import type { Metadata } from "next";
import { SolverClient } from "./solver-client";

export const metadata: Metadata = {
  title: "Step-by-Step Sudoku Solver",
  description:
    "Input your Sudoku puzzle and analyze it with SudoZen's advanced solver. Supports 12+ variants (X-Sudoku, Anti-Knight, Palindrome). Get clear logical deductions and candidate maps step-by-step.",
};

export default function SolverPage() {
  return <SolverClient />;
}
