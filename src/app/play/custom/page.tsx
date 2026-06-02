import type { Metadata } from "next";
import { CustomClient } from "./custom-client";

export const metadata: Metadata = {
  title: "Custom Sudoku Sandbox — Design Your Own Puzzles",
  description:
    "Design and input your own custom Sudoku puzzles at SudoZen. Enter classic 9×9 board strings, define Killer cage constraints with JSON, or configure Thermo, Arrow, and other variant markings in the interactive sandbox.",
  openGraph: {
    title: "Custom Sudoku Sandbox — Design Your Own Puzzles | SudoZen",
    description:
      "Create custom Sudoku puzzles with your own board strings, Killer cage definitions, and variant constraints. Play and solve them with the step-by-step solver.",
    url: "https://sudozen.vercel.app/play/custom",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "Custom Sudoku Sandbox on SudoZen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Sudoku Sandbox — Design Your Own Puzzles | SudoZen",
    description: "Design custom Sudoku puzzles with board strings, Killer cages, and variant constraints.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.vercel.app/play/custom",
  },
};

export default function CustomPlayPage() {
  return <CustomClient />;
}
