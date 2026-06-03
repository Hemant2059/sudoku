"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/play", label: "Play" },
  { href: "/daily", label: "Daily" },
  { href: "/solver", label: "Solver" },
  { href: "/learn", label: "Learn" },
];

export function NavBar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Determine initial theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex items-center justify-center p-0.5 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 32 32" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="16" cy="16" r="13" className="stroke-primary" opacity="0.9" />
              <circle cx="16" cy="16" r="7" className="stroke-secondary-foreground" opacity="0.7" strokeDasharray="3 2" />
              <line x1="16" y1="3" x2="16" y2="29" className="stroke-primary" opacity="0.5" />
              <line x1="3" y1="16" x2="29" y2="16" className="stroke-primary" opacity="0.5" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" className="text-secondary-foreground" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-600 dark:to-indigo-400 bg-clip-text text-transparent">
            SudoZen
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="flex gap-1.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-primary text-primary-foreground shadow-sm shadow-indigo-600/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="w-[1px] h-5 bg-border hidden sm:block" />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-[18px] h-[18px]" />
            ) : (
              <Sun className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
