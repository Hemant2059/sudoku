import type { Metadata } from "next";
import { CustomClient } from "./custom-client";

export const metadata: Metadata = {
  title: "Custom Sudoku Sandbox Puzzles",
  description:
    "Design and input your own custom Sudoku puzzles on SudoZen. Enter classic numbers, customize Killer cage constraints, or configure thermo/arrow variants in our interactive design sandbox.",
};

export default function CustomPlayPage() {
  return <CustomClient />;
}
