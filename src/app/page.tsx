import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Brain, Award, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Play Sudoku Online — Free Classic & Variant Puzzles",
  description:
    "Play classic Sudoku and 12+ variants (Killer, X-Sudoku, Thermo, Arrow, Anti-Knight, Palindrome) online for free at SudoZen. Step-by-step solver with logical hints, pencil marks, cell colors, and interactive strategy guides for all skill levels.",
  openGraph: {
    title: "Play Sudoku Online — Free Classic & Variant Puzzles | SudoZen",
    description:
      "Play free Sudoku online with 12+ variants, a step-by-step logic solver, smart hints, and interactive strategy guides. Classic, Killer, X-Sudoku, Thermo, Arrow, and more.",
    url: "https://sudozen.vercel.app",
    images: [{ url: "/og_image.png", width: 1200, height: 630, alt: "SudoZen Sudoku Online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Sudoku Online — Free Classic & Variant Puzzles | SudoZen",
    description:
      "Play free Sudoku online. Classic, Killer, X-Sudoku, Thermo, Arrow — 12+ variants with a step-by-step logic solver.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: "https://sudozen.vercel.app",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Sudoku?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sudoku is a logic-based number-placement puzzle. The goal is to fill a 9×9 grid so that each row, column, and 3×3 block contains the digits 1–9 exactly once.",
      },
    },
    {
      "@type": "Question",
      name: "Is SudoZen free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, SudoZen is completely free. Play classic Sudoku and 12+ variant modes, use the step-by-step solver, and learn strategies — all without any cost or subscription.",
      },
    },
    {
      "@type": "Question",
      name: "What Sudoku variants does SudoZen support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SudoZen supports 12+ variants: Classic, Killer, X-Sudoku, Hyper-Sudoku, Anti-Knight, Anti-King, Thermo, Arrow, Palindrome, Renban, Kropki Dots, XV, and Greater Than. Each variant adds unique logical constraints.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Sudoku solver work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our solver analyzes your puzzle step by step, showing each logical deduction with strategy names, grid mutations, and proof chains. It supports all 12+ variants and explains techniques like Naked Singles, X-Wing, Swordfish, and forcing chains.",
      },
    },
    {
      "@type": "Question",
      name: "Can I learn Sudoku strategies on SudoZen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Learn section provides an interactive strategy guide covering techniques from Naked Singles (easy) to Forcing Chains (extreme). Each strategy includes example grids, logical explanations, and links to practice in the solver.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col justify-between overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-600/10 via-background to-background dark:from-indigo-950/20 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <div className="w-24 h-24 mx-auto mb-8 bg-card backdrop-blur rounded-3xl flex items-center justify-center border border-border shadow-xl dark:shadow-indigo-950/10 animate-bounce-subtle">
              <svg viewBox="0 0 32 32" className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="16" cy="16" r="13" className="stroke-primary" opacity="0.9" />
                <circle cx="16" cy="16" r="7" className="stroke-indigo-500" opacity="0.7" strokeDasharray="3 2" />
                <line x1="16" y1="3" x2="16" y2="29" className="stroke-primary" opacity="0.5" />
                <line x1="3" y1="16" x2="29" y2="16" className="stroke-primary" opacity="0.5" />
                <circle cx="16" cy="16" r="2.5" fill="currentColor" className="text-indigo-600 dark:text-indigo-400" />
              </svg>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground via-indigo-600 to-primary bg-clip-text text-transparent">
              SudoZen
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Achieve a state of perfect focus. Challenge your mind with classic Sudoku, explore advanced variant mechanics, or master techniques step-by-step.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 max-w-2xl mx-auto">
              <Link
                href="/play"
                className="flex-1 inline-flex h-14 px-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-95 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-200 active:scale-[0.98]"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play Now
              </Link>
              <Link
                href="/solver"
                className="flex-1 inline-flex h-14 px-8 items-center justify-center rounded-2xl bg-card text-foreground font-semibold text-base hover:bg-secondary transition-all border border-border shadow-sm active:scale-[0.98]"
              >
                Open Solver
              </Link>
              <Link
                href="/learn"
                className="flex-1 inline-flex h-14 px-8 items-center justify-center rounded-2xl bg-card text-foreground font-semibold text-base hover:bg-secondary transition-all border border-border shadow-sm active:scale-[0.98]"
              >
                Learn strategies
              </Link>
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        </section>

        {/* How to Play Section */}
        <section className="bg-secondary/40 py-16 md:py-20 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-center">How to Play</h2>
            <p className="text-muted-foreground text-center mb-12 text-sm max-w-md mx-auto">
              Simple rules, infinite depth. SudoZen is designed to build your cognitive endurance.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  icon: <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                  num: "1", 
                  title: "Fill the Grid", 
                  desc: "Place digits 1 to 9 in every empty cell. Ensure every row, column, and 3x3 block contains each digit exactly once." 
                },
                { 
                  icon: <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                  num: "2", 
                  title: "Deduce Logically", 
                  desc: "Every puzzle generated on SudoZen has a unique solution. No guessing is ever required — use logic to find your way." 
                },
                { 
                  icon: <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                  num: "3", 
                  title: "Variant Challenges", 
                  desc: "Advance to Killer Sudoku, X-Sudoku, and more. Unique shape and mathematical constraints create fresh mental challenges." 
                },
              ].map((step) => (
                <div key={step.num} className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">STEP 0{step.num}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Game Modes Grid */}
        <section className="py-16 md:py-20 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-center">Sudoku Variants</h2>
            <p className="text-muted-foreground mb-12 text-center text-sm max-w-xl mx-auto">
              From pure classical boards to complex cages and lines, choose a mental training path:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Classic", color: "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5" },
                { name: "Killer", color: "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5" },
                { name: "X-Sudoku", color: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/5" },
                { name: "Anti-Knight", color: "border-violet-500/20 text-violet-600 dark:text-violet-400 bg-violet-500/5" },
                { name: "Thermo", color: "border-red-500/20 text-red-600 dark:text-red-400 bg-red-500/5" },
                { name: "Arrow", color: "border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/5" },
                { name: "Palindrome", color: "border-pink-500/20 text-pink-600 dark:text-pink-400 bg-pink-500/5" },
                { name: "Renban", color: "border-teal-500/20 text-teal-600 dark:text-teal-400 bg-teal-500/5" },
                { name: "Kropki", color: "border-cyan-500/20 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5" },
                { name: "XV", color: "border-lime-500/20 text-lime-600 dark:text-lime-400 bg-lime-500/5" },
                { name: "Greater Than", color: "border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5" },
                { name: "+ Custom", color: "border-slate-400/20 text-slate-600 dark:text-slate-400 bg-slate-500/5" },
              ].map((v) => (
                <div key={v.name} className={`bg-card rounded-2xl p-4 text-center border shadow-sm hover:scale-[1.03] transition-all duration-200 cursor-pointer ${v.color}`}>
                  <p className="text-sm font-bold">{v.name}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/play" className="inline-flex items-center text-sm font-bold text-primary hover:underline gap-1">
                Explore game lobby
                <span className="text-xs">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features & Productivity */}
        <section className="bg-secondary/40 py-16 md:py-20 border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold tracking-tight mb-12 text-center">Built for Logic</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Dynamic Puzzles", desc: "4 difficulties generated programmatically on demand, ensuring infinite replayability." },
                { title: "High-Focus Playing Sandbox", desc: "Equipped with pencil-marking, custom coloring, candidate filters, undo/redo, and stamp inputs." },
                { title: "Intelligent Solver", desc: "Stuck? The solver analyzes constraints, explaining exact logic steps and patterns." },
                { title: "Interactive Strategy Guide", desc: "Unlock and learn modern tactics (X-Wing, Swordfish, XY-Chains) with interactive boards." },
              ].map((f) => (
                <div key={f.title} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-bold text-sm mb-2 text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-violet-950 text-white py-16 md:py-20 text-center border-t border-border">
          <div className="max-w-3xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Start Training Your Brain</h2>
            <p className="text-indigo-200/80 mb-10 text-base max-w-md mx-auto">
              Dive into our interactive Sudoku grid or paste a custom board code to analyze.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-sm mx-auto">
              <Link
                href="/play"
                className="w-full sm:w-auto inline-flex h-12 px-8 items-center justify-center rounded-2xl bg-white text-indigo-950 font-extrabold text-sm hover:bg-indigo-50 transition-all active:scale-[0.98]"
              >
                Play SudoZen
              </Link>
              <Link
                href="/solver"
                className="w-full sm:w-auto inline-flex h-12 px-8 items-center justify-center rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all ring-1 ring-white/25 active:scale-[0.98]"
              >
                Solver sandbox
              </Link>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground bg-card transition-colors duration-200">
        <p>© {new Date().getFullYear()} SudoZen &mdash; The Zen-Focus Sudoku Application. Crafted with Next.js &amp; Rust.</p>
      </footer>
    </div>
  );
}
