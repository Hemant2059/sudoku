import type { Metadata } from "next";
import { ClassicClient } from "./classic-client";

export const metadata: Metadata = {
  title: "Classic Sudoku Puzzles",
  description:
    "Play classic 9×9 Sudoku online on SudoZen. Choose from Easy, Medium, Hard, or Expert difficulties. Features seamless pencil marks, cell colors, validation, and smart logical hints.",
};

export default function ClassicPlayPage() {
  return <ClassicClient />;
}
