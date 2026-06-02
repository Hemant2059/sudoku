import type { Metadata } from "next";
import { KillerClient } from "./killer-client";

export const metadata: Metadata = {
  title: "Killer Sudoku Puzzles — Play Free Online with Cage Sums",
  description:
    "Play Killer Sudoku online for free at SudoZen. Combines classic Sudoku logic with cage arithmetic — digits in each dotted cage must sum to the given clue and cannot repeat. Features hints, pencil marks, and a cage-aware step-by-step solver.",
  openGraph: {
    title: "Killer Sudoku Puzzles — Play Free Online | SudoZen",
    description:
      "Play free Killer Sudoku online with cage sums and classic Sudoku logic. Step-by-step solver, hints, and pencil marks included.",
    url: "https://sudozen.com/play/killer",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "Killer Sudoku on SudoZen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Killer Sudoku Puzzles — Play Free Online | SudoZen",
    description: "Play free Killer Sudoku with cage sums, hints, and a dedicated step-by-step solver.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.com/play/killer",
  },
};

export default function KillerPlayPage() {
  return <KillerClient />;
}
