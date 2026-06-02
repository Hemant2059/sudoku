import type { Metadata } from "next";
import { ExtraRuleClient } from "./extra-rule-client";

export const metadata: Metadata = {
  title: "Extra Rule Sudoku Variants — 11+ Creative Modes",
  description:
    "Explore 11+ creative Sudoku variants at SudoZen: X-Sudoku with diagonal constraints, Hyper-Sudoku with extra windows, Thermo, Arrow, Palindrome, Renban, Kropki Dots, XV, Greater Than, Anti-Knight, and Anti-King. Each variant adds unique logical challenges.",
  openGraph: {
    title: "Extra Rule Sudoku Variants — X-Sudoku, Thermo, Arrow & More | SudoZen",
    description:
      "Play 11+ creative Sudoku variants including X-Sudoku, Hyper-Sudoku, Thermo, Arrow, Palindrome, Renban, Kropki, XV, Greater Than, Anti-Knight, and Anti-King.",
    url: "https://sudozen.vercel.app/play/extra-rule",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "Extra Rule Sudoku Variants on SudoZen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Extra Rule Sudoku Variants — X-Sudoku, Thermo, Arrow & More | SudoZen",
    description:
      "Play 11+ Sudoku variants: X-Sudoku, Hyper, Thermo, Arrow, Palindrome, Renban, Kropki, XV, Greater Than, Anti-Knight, Anti-King.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.vercel.app/play/extra-rule",
  },
};

export default function ExtraRulePlayPage() {
  return <ExtraRuleClient />;
}
