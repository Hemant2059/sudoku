import type { Metadata } from "next";
import { ExtraRuleClient } from "./extra-rule-client";

export const metadata: Metadata = {
  title: "Extra Rule Sudoku Variants",
  description:
    "Choose from 11+ creative Sudoku variants on SudoZen, including X-Sudoku, Hyper-Sudoku, Thermo, Arrow, Renban, and Kropki. Play online with custom high-focus themes.",
};

export default function ExtraRulePlayPage() {
  return <ExtraRuleClient />;
}
