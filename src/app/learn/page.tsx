import type { Metadata } from "next";
import { LearnClient } from "./learn-client";

export const metadata: Metadata = {
  title: "Sudoku Strategy Guide",
  description:
    "Learn Sudoku solving strategies step-by-step with SudoZen. Master logical techniques (Naked Single, Pointing Pairs, X-Wing, XY-Chain, Swordfish) with interactive candidate grid diagrams.",
};

export default function LearnPage() {
  return <LearnClient />;
}
