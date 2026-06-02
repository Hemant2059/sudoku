import type { Metadata } from "next";
import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Play Sudoku & Variants",
  description:
    "Choose a game mode on SudoZen. Play Classic Sudoku, Killer Sudoku, 11+ extra-rule variants (Thermo, Arrow, Palindrome), or create a custom board.",
};

export default function PlayPage() {
  return <PlayClient />;
}
