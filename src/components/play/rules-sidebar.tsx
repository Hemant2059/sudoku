"use client";

import { useEffect, useRef } from "react";

interface RulesSidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: string;
}

export function RulesSidebar({ open, onClose, variant }: RulesSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-zinc-900 shadow-2xl border-l border-slate-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">How to Play</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-57px)] p-4 text-sm text-slate-500 dark:text-slate-400 space-y-4 font-serif [&_strong]:font-semibold [&_strong]:text-slate-700 dark:[&_strong]:text-slate-300">
          <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
            <strong className="text-slate-700 dark:text-slate-300">Rules</strong>
            <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
              <li>Each <strong>row</strong> must contain digits 1&ndash;9 exactly once.</li>
              <li>Each <strong>column</strong> must contain digits 1&ndash;9 exactly once.</li>
              <li>Each 3&times;3 <strong>box</strong> must contain digits 1&ndash;9 exactly once.</li>
              <li>The puzzle starts with some given digits (clues). You fill in the rest.</li>
              <li>Every puzzle has exactly <strong>one unique solution</strong>.</li>
            </ul>
          </div>

          {variant === "xsudoku" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">X-Sudoku</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>In addition to regular rules, both <strong>main diagonals</strong> must contain digits 1&ndash;9 exactly once.</li>
                <li>The main diagonal runs from <strong>top-left to bottom-right</strong>.</li>
                <li>The anti-diagonal runs from <strong>top-right to bottom-left</strong>.</li>
                <li>Diagonal lines are shown in <strong>amber</strong> on the grid.</li>
                <li>Duplicate digits on either diagonal appear as <strong>conflicts</strong> (red highlight).</li>
              </ul>
            </div>
          )}

          {variant === "hyper" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Hyper-Sudoku (Windoku)</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>In addition to regular rules, four extra 3&times;3 <strong>windows</strong> must contain digits 1&ndash;9 exactly once.</li>
                <li>The extra windows overlap the standard boxes at the four corners of the grid center.</li>
                <li>Windows are shown with <strong>sky-blue</strong> dashed outlines.</li>
                <li>Duplicate digits in any window appear as <strong>conflicts</strong>.</li>
              </ul>
            </div>
          )}

          {variant === "antiknight" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Anti-Knight</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>Cells a <strong>knight&rsquo;s move</strong> apart (like chess) cannot contain the same digit.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "antiking" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Anti-King</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>Cells a <strong>king&rsquo;s move</strong> apart (all 8 surrounding cells) cannot contain the same digit.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "thermo" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Thermo</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>Digits along a <strong>thermometer</strong> must strictly increase from the bulb to the tip.</li>
                <li>The bulb end (circle) has the smallest digit; the tip end has the largest.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "arrow" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Arrow</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>Digits on an <strong>arrow line</strong> sum to the digit in the attached <strong>circle</strong>.</li>
                <li>The circle digit equals the total of all digits along the arrow path.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "palindrome" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Palindromic</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>Digits on marked <strong>palindrome lines</strong> read the same forwards and backwards.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "renban" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Renban</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>Digits on a <strong>Renban line</strong> form a consecutive set (e.g., 3-4-5-6).</li>
                <li>Digits cannot repeat on the same Renban line.</li>
                <li>The order of digits along the line does not matter.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "kropki" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Kropki</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>A <strong>white dot</strong> between adjacent cells means the digits are <strong>consecutive</strong> (e.g., 3 and 4).</li>
                <li>A <strong>black dot</strong> between adjacent cells means one digit is <strong>double</strong> the other (e.g., 3 and 6).</li>
                <li>If no dot is present, the pair does <em>not</em> have either relationship.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "xv" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">XV</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li>A <strong>V</strong> between adjacent digits means they <strong>sum to 5</strong>.</li>
                <li>An <strong>X</strong> between adjacent digits means they <strong>sum to 10</strong>.</li>
                <li>All possible V and X markers are given; any adjacent pair without a marker does not sum to 5 or 10.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "greaterthan" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Greater Than</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li><strong>Inequality signs</strong> (&lt; or &gt;) between adjacent cells indicate their relative order.</li>
                <li>The digit at the open end is <strong>greater</strong> than the digit at the pointed end.</li>
                <li>Regular Sudoku rules still apply.</li>
              </ul>
            </div>
          )}

          {variant === "killer" && (
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
              <strong className="text-slate-700 dark:text-slate-300">Killer Sudoku</strong>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                <li><strong>Cages</strong> &mdash; Dashed regions with a sum shown in the top-left cell.</li>
                <li>Digits within a cage <strong>cannot repeat</strong>.</li>
                <li>The sum of all digits in a cage must equal the <strong>cage sum</strong>.</li>
                <li>Regular Sudoku rules still apply (no repeats in any row, column, or 3&times;3 box).</li>
                <li>Cells with cage sum or repeat violations appear as <strong>conflicts</strong> (red highlight).</li>
              </ul>
            </div>
          )}

          <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
            <strong className="text-slate-700 dark:text-slate-300">Game Controls</strong>
            <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
              <li><strong>Erase</strong> &mdash; Remove the value from the selected cell.</li>
              <li><strong>Clear</strong> &mdash; Reset all user entries back to the starting puzzle.</li>
              <li><strong>Notes</strong> &mdash; Toggle pencil-mark mode to jot down candidate digits.</li>
              <li><strong>Center</strong> &mdash; Toggle center-mark mode to highlight confirmed digit subsets.</li>
              <li><strong>Auto-fill</strong> &mdash; Fill candidate notes for all empty cells at once.</li>
              <li><strong>Hint</strong> &mdash; Reveal the next logical step with highlighted cells.</li>
            </ul>
          </div>

          <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
            <strong className="text-slate-700 dark:text-slate-300">Conflict Detection</strong>
            <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
              <li><strong>Conflicts</strong> &mdash; Highlights cells with duplicate digits in the same row, column, or box.</li>
              <li><strong>Wrong</strong> &mdash; Highlights cells that don't match the solution.</li>
              <li><strong>Off</strong> &mdash; No conflict highlights.</li>
            </ul>
          </div>

          <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
            <strong className="text-slate-700 dark:text-slate-300">Keyboard Shortcuts</strong>
            <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
              <li><strong>1&ndash;9</strong> &mdash; Enter a value depending on active mode (Value / Notes / Center).</li>
              <li><strong>Shift+1&ndash;9</strong> &mdash; Force toggle a pencil mark on <em>all</em> selected cells.</li>
              <li><strong>Ctrl/Cmd+1&ndash;9</strong> &mdash; Force toggle a center mark on <em>all</em> selected cells.</li>
              <li><strong>0 / Delete / Backspace</strong> &mdash; Erase selected cell(s).</li>
              <li><strong>Arrow keys / WASD</strong> &mdash; Navigate the grid. Hold <strong>Shift</strong> to extend the selection.</li>
              <li><strong>Double-tap a digit</strong> &mdash; Stamp that number on subsequent cell clicks.</li>
              <li><strong>Long-press a cell</strong> &mdash; Erase its value (300ms).</li>
              <li><strong>Ctrl+Z / Ctrl+Y</strong> &mdash; Undo / Redo.</li>
              <li><strong>Ctrl/Cmd+A</strong> &mdash; Select all non-given cells.</li>
              <li><strong>H</strong> &mdash; Get a hint.</li>
              <li><strong>Escape</strong> &mdash; Clear selection and dismiss hints.</li>
            </ul>
          </div>

          <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
            <strong className="text-slate-700 dark:text-slate-300">Submit</strong>
            <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
              <li><strong>Submit</strong> &mdash; Submit the completed grid for validation. All cells must be filled.</li>
            </ul>
          </div>

          <div className="border-b border-slate-200 dark:border-zinc-700 pb-4">
            <strong className="text-slate-700 dark:text-slate-300">Multi-Select</strong>
            <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
              <li><strong>Ctrl/Cmd+click</strong> &mdash; Toggle a cell into the multi-selection set.</li>
              <li><strong>Shift+arrow</strong> &mdash; Extend selection as you move.</li>
              <li>Color, pencil marks, erase, and erase-color all apply to <em>every</em> selected cell.</li>
              <li>Value placement and number stamp affect only the <strong>primary</strong> (last-clicked) cell.</li>
            </ul>
          </div>

          <p><strong className="text-slate-700 dark:text-slate-300">Color Marker:</strong> Select a color from the picker, then tap a cell to mark it. Tap the same color again to remove it. Works on multiple selected cells.</p>
        </div>
      </div>
    </>
  );
}
