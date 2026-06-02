import type { Metadata } from "next";
import { ClassicClient } from "./classic-client";

export const metadata: Metadata = {
  title: "Classic Sudoku Puzzles — Easy, Medium, Hard & Expert",
  description:
    "Play classic 9×9 Sudoku online for free at SudoZen. Choose from Easy, Medium, Hard, or Expert difficulty levels. Features pencil marks, cell colors, conflict validation, undo/redo, and smart logical hints powered by a step-by-step solver.",
  openGraph: {
    title: "Classic Sudoku Puzzles — Play Free Online | SudoZen",
    description:
      "Play free classic 9×9 Sudoku puzzles online. Easy, Medium, Hard, and Expert levels with pencil marks, hints, and an intelligent logic solver.",
    url: "https://sudozen.com/play/classic",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "Classic Sudoku on SudoZen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classic Sudoku Puzzles — Play Free Online | SudoZen",
    description: "Play free classic 9×9 Sudoku with hints, pencil marks, and a step-by-step solver.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.com/play/classic",
  },
};

export default function ClassicPlayPage() {
  return <ClassicClient />;
}
