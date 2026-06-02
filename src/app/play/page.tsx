import type { Metadata } from "next";
import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Play Sudoku & Variants — Classic, Killer & Extra Rules",
  description:
    "Choose from 12+ Sudoku game modes at SudoZen. Play Classic Sudoku, Killer Sudoku with cage sums, X-Sudoku with diagonal constraints, Thermo, Arrow, Palindrome, Renban, Kropki, and more. Create custom boards in the sandbox mode.",
  openGraph: {
    title: "Play Sudoku & Variants — Classic, Killer & Extra Rules | SudoZen",
    description:
      "Play 12+ Sudoku variants online: Classic, Killer, X-Sudoku, Thermo, Arrow, Palindrome, Renban, Kropki, Anti-Knight, and more. Create custom puzzles in sandbox mode.",
    url: "https://sudozen.vercel.app/play",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "SudoZen Play Sudoku" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Sudoku & Variants — Classic, Killer & Extra Rules | SudoZen",
    description: "Play 12+ Sudoku variants online with a step-by-step solver and smart hints.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.vercel.app/play",
  },
};

export default function PlayPage() {
  return <PlayClient />;
}
