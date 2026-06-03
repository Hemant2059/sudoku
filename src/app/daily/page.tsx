import type { Metadata } from "next";
import { DailyClient } from "./daily-client";

const baseUrl = "https://sudozen.vercel.app";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Daily Sudoku Challenge | SudoZen",
  description:
    "A fresh classic sudoku puzzle every day. Compete against the clock and track your best times in the daily challenge.",
  openGraph: {
    title: "Daily Sudoku Challenge | SudoZen",
    description: "A fresh classic sudoku puzzle every day. Compete against the clock.",
    url: `${baseUrl}/daily`,
    siteName: "SudoZen",
    type: "website",
    images: [{ url: `${baseUrl}/og_image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Sudoku Challenge | SudoZen",
    description: "A fresh classic sudoku puzzle every day. Compete against the clock.",
    images: [`${baseUrl}/og_image.png`],
  },
  alternates: { canonical: `${baseUrl}/daily` },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
  },
};

export default function DailyPage() {
  return <DailyClient />;
}
