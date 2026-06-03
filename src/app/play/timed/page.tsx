import type { Metadata } from "next";
import { TimedClient } from "./timed-client";

const baseUrl = "https://sudozen.vercel.app";

export const metadata: Metadata = {
  title: "Timed Sudoku Challenge | SudoZen",
  description:
    "Race against the clock in timed sudoku. Choose your difficulty and solve the puzzle before time runs out.",
  openGraph: {
    title: "Timed Sudoku Challenge | SudoZen",
    description: "Race against the clock in timed sudoku. Solve the puzzle before time runs out.",
    url: `${baseUrl}/play/timed`,
    siteName: "SudoZen",
    type: "website",
    images: [{ url: `${baseUrl}/og_image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Timed Sudoku Challenge | SudoZen",
    description: "Race against the clock in timed sudoku.",
    images: [`${baseUrl}/og_image.png`],
  },
  alternates: { canonical: `${baseUrl}/play/timed` },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
  },
};

export default function TimedPage() {
  return <TimedClient />;
}
