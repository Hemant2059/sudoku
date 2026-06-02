import type { Metadata } from "next";

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

const variantKeywords: Record<string, string[]> = {
  xsudoku: ["x sudoku", "x-sudoku", "diagonal sudoku", "sudoku x"],
  hyper: ["hyper sudoku", "window sudoku", "hyper sudoku online"],
  antiknight: ["anti knight sudoku", "knight move sudoku", "anti-knight"],
  antiking: ["anti king sudoku", "king move sudoku", "anti-king"],
  thermo: ["thermo sudoku", "thermometer sudoku", "thermo sudoku online"],
  arrow: ["arrow sudoku", "arrow sudoku online", "sum sudoku variant"],
  palindrome: ["palindrome sudoku", "palindromic sudoku", "palindrome puzzle"],
  renban: ["renban sudoku", "renban line sudoku", "consecutive sudoku"],
  kropki: ["kropki sudoku", "kropki dots", "dot sudoku"],
  xv: ["xv sudoku", "x v sudoku", "sum sudoku xv"],
  greaterthan: ["greater than sudoku", "inequality sudoku", "greater sudoku"],
};

const baseUrl = "https://sudozen.com";

type Props = {
  params: Promise<{ variant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
  const meta = variantMeta[variant];
  const keywords = variantKeywords[variant] || [];

  if (!meta) {
    return {
      title: "Sudoku Variant Puzzle",
      description: "Play creative Sudoku variants online at SudoZen.",
      alternates: { canonical: `${baseUrl}/play/extra-rule/${variant}` },
    };
  }

  return {
    title: `${meta.name} — Play Free Online`,
    description: `Play ${meta.name} Sudoku online for free at SudoZen. ${meta.description} Features step-by-step solver, logical hints, pencil marks, and a distraction-free interface.`,
    keywords: [...keywords, "sudoku variants", "play sudoku online", "sudozen"],
    openGraph: {
      title: `${meta.name} Sudoku — Play Free Online | SudoZen`,
      description: `Play free ${meta.name} Sudoku online. ${meta.description} Hints, solver, and pencil marks included.`,
      url: `${baseUrl}/play/extra-rule/${variant}`,
      images: [{ url: "/og_image.png", width: 1200, height: 630, alt: `${meta.name} Sudoku on SudoZen` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.name} Sudoku — Play Free Online | SudoZen`,
      description: `Play free ${meta.name} Sudoku online with hints and a step-by-step solver.`,
      images: ["/og_image.png"],
    },
    alternates: {
      canonical: `${baseUrl}/play/extra-rule/${variant}`,
    },
  };
}

export default async function VariantPlayPage({ params }: Props) {
  const { variant } = await params;
  const { VariantClient } = await import("./variant-client");
  return <VariantClient variant={variant} />;
}
