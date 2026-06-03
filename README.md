# SudoZen — Play, Solve & Learn Sudoku Online

A modern, high-focus Sudoku web application built with **Next.js 16**, **Rust**, and **Tailwind CSS 4**. Play classic Sudoku and 12+ variants with a step-by-step logic solver, smart hints, and interactive strategy guides.

## Features

- **12+ Sudoku Variants** — Classic, Killer, X-Sudoku, Hyper, Anti-Knight, Anti-King, Thermo, Arrow, Palindrome, Renban, Kropki, XV, Greater Than
- **Step-by-Step Solver** — Input any puzzle and walk through each logical deduction with strategy names and proof chains
- **Smart Hint System** — Get the next logical step explained, with grid highlights and strategy descriptions
- **Pencil Marks & Center Marks** — Toggleable note entry modes for candidates
- **Cell Coloring** — Color-code cells to track patterns
- **Undo/Redo** — Full history with up to 100 steps
- **Keyboard Shortcuts** — Ctrl+Z/Y (undo/redo), Shift+1-9 (pencil), Ctrl+1-9 (center), H (hint), Del (erase), arrow keys (navigation)
- **Interactive Strategy Guide** — Learn techniques from Naked Singles to Forcing Chains with example grids
- **Fullscreen Mode** — Distraction-free playing experience
- **Dark Mode** — Theme toggle with system preference detection
- **SEO Optimized** — Full metadata, Open Graph, Twitter cards, JSON-LD structured data (WebApplication, FAQ, HowTo, BreadcrumbList), sitemap
- **Mobile Responsive** — Optimized for all screen sizes
- **Print & Export** — Print puzzles or export to clipboard as JSON

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Fonts | Geist (UI), JetBrains Mono (code/grid) |
| Backend logic | Rust binary (engine) |
| API | Next.js API routes (`/api/*`) |

## Prerequisites

- **Node.js** 20+
- **Rust binary** at `bin/soduko` (or set `SODUKO_BIN` env var)

## Getting Started

```bash
# Install dependencies
npm install

# Copy the Rust engine binary
cp /path/to/soduko/target/release/soduko bin/soduko

# Start development server
npm run dev
```

Open [https://sudozen.vercel.app](https://sudozen.vercel.app) in your browser.

## Rust Binary

The Sudoku engine is a standalone Rust binary at `rust/` that handles puzzle generation, solving, and hint computation.

### Build locally

```bash
cd rust
cargo build --release
cp target/release/soduko ../bin/soduko
cd ..
```

### How it works

- Default path: `bin/soduko` (relative to project root)
- Override with: `SODUKO_BIN` environment variable
- On **Vercel**: the `vercel.json` build command compiles the Rust binary during deployment
- On **local dev**: build manually using the steps above
- The binary is called via `execFileSync` from the API routes

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          — Root layout, metadata, JSON-LD
│   ├── page.tsx            — Home page
│   ├── sitemap.ts          — Auto-generated sitemap
│   ├── robots.ts           — Robots configuration
│   ├── play/               — Play mode pages
│   │   ├── page.tsx        — Mode selection lobby
│   │   ├── classic/        — Classic Sudoku
│   │   ├── killer/         — Killer Sudoku
│   │   ├── custom/         — Custom sandbox
│   │   └── extra-rule/     — Variant modes (X-Sudoku, Thermo, etc.)
│   ├── solver/             — Step-by-step solver
│   └── learn/              — Strategy guide
├── components/
│   ├── play/               — Game UI components
│   │   ├── play-game.tsx   — Main game component
│   │   ├── game-header.tsx — Timer, difficulty, controls
│   │   ├── number-pad.tsx  — Number input pad
│   │   └── ...
│   ├── sudoku-grid.tsx     — Grid with memoized cells
│   ├── nav-bar.tsx         — Navigation + theme toggle
│   └── toast.tsx           — Toast notification system
└── lib/
    ├── engine.ts           — Rust binary wrapper
    ├── sudoku.ts           — Grid utilities & conflict detection
    ├── strategies.ts       — Strategy definitions & descriptions
    ├── seo.ts              — usePageTitle hook
    └── types.ts            — TypeScript type definitions
```

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/generate` | GET | Generate a classic puzzle |
| `/api/solve` | POST | Solve a puzzle step-by-step |
| `/api/variant/generate` | GET | Generate a variant puzzle |
| `/api/variant/solve` | POST | Solve a variant puzzle |
| `/api/killer/generate` | GET | Generate a Killer Sudoku |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
