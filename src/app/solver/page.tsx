import type { Metadata } from "next";
import { SolverClient } from "./solver-client";

export const metadata: Metadata = {
  title: "Step-by-Step Sudoku Solver — Logic-Based Puzzle Solver Online",
  description:
    "Solve any Sudoku puzzle step-by-step at SudoZen. Supports 12+ variants including Classic, Killer, X-Sudoku, Anti-Knight, Thermo, Arrow, Palindrome, and more. Each step shows the strategy name, grid mutations, and proof chains. Understand the logic, not just the answer.",
  openGraph: {
    title: "Step-by-Step Sudoku Solver — Free Online Logic Solver | SudoZen",
    description:
      "Solve Sudoku puzzles step-by-step with detailed logic explanations. Supports 12+ variants. Shows strategy names, grid mutations, and proof chains for each deduction.",
    url: "https://sudozen.vercel.app/solver",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "Sudoku Solver on SudoZen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Step-by-Step Sudoku Solver — Free Online Logic Solver | SudoZen",
    description:
      "Solve any Sudoku puzzle step-by-step. Classic, Killer, X-Sudoku, Thermo, Arrow — each step explained with strategy names and proof chains.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.vercel.app/solver",
  },
};

export default function SolverPage() {
  return <SolverClient />;
}
