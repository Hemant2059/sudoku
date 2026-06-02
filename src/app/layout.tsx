import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { ToastProvider } from "@/components/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SudoZen — Play, Solve & Learn Sudoku Online",
    template: "%s — SudoZen",
  },
  description:
    "SudoZen is the ultimate premium online Sudoku platform. Play classic Sudoku and 12+ variants (Killer, X-Sudoku, Thermo, Arrow). Learn professional logic strategies with our interactive step-by-step solver.",
  keywords: [
    "sudoku",
    "sudozen",
    "sudozen sudoku",
    "play sudoku online",
    "sudoku solver",
    "step-by-step sudoku solver",
    "killer sudoku online",
    "sudoku variants",
    "thermo sudoku",
    "arrow sudoku",
    "learn sudoku strategies",
    "sudoku hints",
  ],
  openGraph: {
    title: "SudoZen — Play, Solve & Learn Sudoku Online",
    description:
      "Play classic and variant Sudoku online on SudoZen. Enjoy a high-focus, premium interface with hints, pencil marks, colors, and a step-by-step solver.",
    url: "https://sudozen.com",
    siteName: "SudoZen",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SudoZen — Play, Solve & Learn Sudoku Online",
    description:
      "Play classic and variant Sudoku online on SudoZen. High-focus design with advanced solver guides.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SudoZen",
  description:
    "Play classic Sudoku and 12+ variants online. Train your mind with a high-focus premium interface, step-by-step solver, and interactive logic lessons.",
  applicationCategory: "GameApplication",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Classic Sudoku",
    "Killer Sudoku",
    "X-Sudoku",
    "Thermo Sudoku",
    "Arrow Sudoku",
    "Step-by-step solver",
    "Hint system",
    "Pencil marks",
    "Undo/redo",
    "High-focus design",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <NavBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
