import type { Metadata } from "next";
import { KillerClient } from "./killer-client";

export const metadata: Metadata = {
  title: "Killer Sudoku Puzzles",
  description:
    "Challenge yourself with Killer Sudoku on SudoZen. Combines standard Sudoku logic with cage math sums. Digits cannot repeat within dotted outline cages.",
};

export default function KillerPlayPage() {
  return <KillerClient />;
}
