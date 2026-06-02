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

const baseUrl = "https://sudozen.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SudoZen — Play, Solve & Learn Sudoku Online",
    template: "%s — SudoZen",
  },
  description:
    "Play classic Sudoku and 12+ variants (Killer, X-Sudoku, Thermo, Arrow, Palindrome, Anti-Knight) online at SudoZen. Step-by-step solver, logical hints, pencil marks, and interactive strategy guides for beginners to experts.",
  keywords: [
    "sudoku",
    "play sudoku online",
    "free sudoku",
    "sudoku game",
    "classic sudoku",
    "killer sudoku",
    "killer sudoku online",
    "x sudoku",
    "xsudoku",
    "thermo sudoku",
    "arrow sudoku",
    "palindrome sudoku",
    "renban sudoku",
    "kropki sudoku",
    "anti knight sudoku",
    "anti king sudoku",
    "hyper sudoku",
    "greater than sudoku",
    "xv sudoku",
    "sudoku variants",
    "sudoku solver",
    "step by step sudoku solver",
    "sudoku hints",
    "sudoku strategy",
    "learn sudoku",
    "sudoku techniques",
    "naked single",
    "hidden single",
    "x wing sudoku",
    "swordfish sudoku",
    "sudoku online free",
    "sudozen",
  ],
  openGraph: {
    title: "SudoZen — Play, Solve & Learn Sudoku Online",
    description:
      "Play classic and variant Sudoku online. High-focus interface with pencil marks, cell colors, undo/redo, stamp input, and an intelligent step-by-step logic solver. 12+ variants including Killer, X-Sudoku, Thermo, Arrow, Palindrome, and Anti-Knight.",
    url: baseUrl,
    siteName: "SudoZen",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "SudoZen — Sudoku Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SudoZen — Play, Solve & Learn Sudoku Online",
    description:
      "Play classic and variant Sudoku online. Step-by-step solver, hints, and interactive strategy guides. 12+ variants including Killer, X-Sudoku, and Thermo.",
    images: ["/og_image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE",
  // },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "SudoZen",
      url: baseUrl,
      description:
        "Play classic and variant Sudoku online with a high-focus premium interface. Features step-by-step solver, logical hints, pencil marks, cell colors, undo/redo, and 12+ variant modes.",
      applicationCategory: "GameApplication",
      browserRequirements: "Requires JavaScript",
      operatingSystem: "All",
      image: `${baseUrl}/og_image.png`,
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
        "Palindrome Sudoku",
        "Renban Sudoku",
        "Kropki Sudoku",
        "Anti-Knight Sudoku",
        "Anti-King Sudoku",
        "Hyper Sudoku",
        "Greater Than Sudoku",
        "XV Sudoku",
        "Step-by-step logic solver",
        "Smart hint system",
        "Pencil marks & center marks",
        "Cell coloring",
        "Undo/redo",
        "Keyboard shortcuts",
        "Print & export",
        "Interactive strategy guide",
      ],
      screenshot: {
        "@type": "ImageObject",
        url: `${baseUrl}/og_image.png`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/solver?puzzle={puzzle_string}`,
        "query-input": "required name=puzzle_string",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Play Sudoku", item: `${baseUrl}/play` },
        { "@type": "ListItem", position: 3, name: "Sudoku Solver", item: `${baseUrl}/solver` },
        { "@type": "ListItem", position: 4, name: "Learn Sudoku Strategies", item: `${baseUrl}/learn` },
      ],
    },
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
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <ToastProvider>
          <NavBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
