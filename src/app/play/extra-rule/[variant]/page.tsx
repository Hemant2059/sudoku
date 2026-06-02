import type { Metadata } from "next";
import { VariantClient } from "./variant-client";

const variantMeta: Record<string, { name: string; description: string }> = {
  xsudoku: { name: "X-Sudoku", description: "Both main diagonals must also contain digits 1–9 exactly once." },
  hyper: { name: "Hyper-Sudoku", description: "Four extra 3×3 windows must also contain digits 1–9 exactly once." },
  antiknight: { name: "Anti-Knight", description: "Cells a knight's move apart cannot contain the same digit." },
  antiking: { name: "Anti-King", description: "Cells a king's move apart (including diagonals) cannot share a digit." },
  thermo: { name: "Thermo", description: "Digits along a thermometer must strictly increase from bulb to tip." },
  arrow: { name: "Arrow", description: "Digits on an arrow line sum to the digit in the attached circle." },
  palindrome: { name: "Palindromic", description: "Digits on marked lines read the same forwards and backwards." },
  renban: { name: "Renban", description: "Digits on a Renban line form a consecutive set (no repeats)." },
  kropki: { name: "Kropki", description: "White dot = consecutive digits. Black dot = one digit is double the other." },
  xv: { name: "XV", description: "V = adjacent digits sum to 5. X = adjacent digits sum to 10." },
  greaterthan: { name: "Greater Than", description: "Inequality signs between adjacent cells indicate their relative order." },
};

type Props = {
  params: Promise<{ variant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
  const meta = variantMeta[variant];
  return {
    title: meta ? `${meta.name} Variant Sudoku` : "Variant Sudoku Puzzle",
    description: meta 
      ? `${meta.name} Puzzle: ${meta.description} Play this advanced constraint board on SudoZen.`
      : "Play creative Sudoku variants online on SudoZen.",
  };
}

export default async function VariantPlayPage({ params }: Props) {
  const { variant } = await params;
  return <VariantClient variant={variant} />;
}
