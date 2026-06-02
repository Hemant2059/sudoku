import type { Metadata } from "next";
import { LearnClient } from "./learn-client";

export const metadata: Metadata = {
  title: "Learn Sudoku Strategies — Step-by-Step Guide from Easy to Extreme",
  description:
    "Master Sudoku solving techniques at SudoZen. Learn Naked Singles, Hidden Singles, Pointing Pairs, X-Wing, Swordfish, XY-Chains, Forcing Chains, and more. Each strategy includes example grids, logical explanations, and interactive practice in the solver.",
  openGraph: {
    title: "Learn Sudoku Strategies — Step-by-Step Guide | SudoZen",
    description:
      "Master Sudoku strategies with interactive guides. Naked Single, X-Wing, Swordfish, XY-Chain, and more — from beginner to extreme techniques.",
    url: "https://sudozen.vercel.app/learn",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "Learn Sudoku Strategies on SudoZen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Sudoku Strategies — Step-by-Step Guide | SudoZen",
    description:
      "Master Sudoku from Naked Singles to Forcing Chains. Interactive strategy guide with example grids and practice links.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.vercel.app/learn",
  },
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Solve Sudoku Puzzles Step by Step",
  description:
    "Master Sudoku solving from basic to extreme techniques. Each strategy builds on the previous ones to solve any Sudoku puzzle using pure logic.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Naked Singles & Hidden Singles",
      text: "Look for cells that can only contain one possible digit (Naked Single) or digits that can only go in one cell within a row, column, or box (Hidden Single). Fill these cells first — they are the building blocks of all Sudoku solutions.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Naked Subsets & Pointing Pairs",
      text: "When N digits share N cells within a unit (Naked Subset), those digits are locked — remove them from other cells in the unit. Pointing Pairs occur when candidates are confined to one row or column within a box, allowing eliminations outside the box.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "X-Wing & Swordfish",
      text: "X-Wing: when a candidate appears in exactly two rows (or columns) and aligns in exactly two columns (or rows), forming a rectangle that lets you eliminate the candidate from other cells in those columns/rows. Swordfish extends the same logic to three rows and three columns.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "XY-Chains & Alternating Inference Chains",
      text: "Build chains of bi-value cells (cells with exactly two candidates) where each adjacent pair shares a candidate. If the chain starts and ends with the same candidate in a way that forces a contradiction, you can eliminate that candidate from all cells that see both ends.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Forcing Chains & Contradiction Chains",
      text: "For extreme puzzles, test a candidate in a cell and follow the logical consequences. If both possibilities lead to the same result or a contradiction, you can safely place or eliminate the candidate. This covers techniques like Bowman Bingo and Nishio.",
    },
  ],
};

export default function LearnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <LearnClient />
    </>
  );
}
