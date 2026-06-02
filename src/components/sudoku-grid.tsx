"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type {
  CellState,
  CellValue,
  InputMode,
  HintHighlights,
  Cage,
  VariantConstraints,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const CAGE_BORDER = "#64748b";

interface CageInfo {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  sum: number | null;
}

function computeCageInfo(cages: Cage[]): Map<number, CageInfo> {
  const byCell = new Map<number, CageInfo>();
  for (const cage of cages) {
    let topLeft = cage.cells[0];
    for (const idx of cage.cells) {
      const r = Math.floor(idx / 9), c = idx % 9;
      const tr = Math.floor(topLeft / 9), tc = topLeft % 9;
      if (r < tr || (r === tr && c < tc)) topLeft = idx;
    }
    for (const idx of cage.cells) {
      const r = Math.floor(idx / 9), c = idx % 9;
      byCell.set(idx, {
        top: r === 0 || !cage.cells.includes(idx - 9),
        right: c === 8 || !cage.cells.includes(idx + 1),
        bottom: r === 8 || !cage.cells.includes(idx + 9),
        left: c === 0 || !cage.cells.includes(idx - 1),
        sum: idx === topLeft ? cage.sum : null,
      });
    }
  }
  return byCell;
}

interface CellButtonProps {
  cell: CellState;
  index: number;
  selectedIndex: number | null;
  isMultiSelected: boolean;
  isSameValue: boolean;
  isSameRow: boolean;
  isSameCol: boolean;
  isSameBox: boolean;
  isGreen: boolean;
  isRed: boolean;
  isUnitCell: boolean;
  elimMap: Map<string, true>;
  cageInfo: CageInfo | undefined;
  onCellClick: (index: number, e: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void;
  onCellPointerDown?: (index: number) => void;
  onCellPointerUp?: () => void;
  solved: boolean;
}

const CellButton = memo(function CellButton({
  cell,
  index,
  selectedIndex,
  isMultiSelected,
  isSameValue,
  isSameRow,
  isSameCol,
  isSameBox,
  isGreen,
  isRed,
  isUnitCell,
  elimMap,
  cageInfo,
  onCellClick,
  onCellPointerDown,
  onCellPointerUp,
  solved,
}: CellButtonProps) {
  const idx = index;
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const isSelected = idx === selectedIndex;
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;
  const hasCandidates = !cell.value && cell.candidates.size > 0;

  if (!cell) return null;

  return (
    <button
      data-cell-index={idx}
      role="gridcell"
      aria-label={`Row ${row + 1}, Column ${col + 1}${
        cell.given ? `, Given ${cell.value}` : cell.value ? `, Value ${cell.value}` : ", Empty"
      }`}
      onClick={(e) => {
        (e.currentTarget.closest("[tabindex]") as HTMLElement)?.focus();
        onCellClick(idx, { ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey });
      }}
      onPointerDown={() => onCellPointerDown?.(idx)}
      onPointerUp={() => onCellPointerUp?.()}
      onPointerLeave={() => onCellPointerUp?.()}
      className={cn(
        "relative flex items-center justify-center font-sans font-medium transition-all duration-150 outline-none cursor-pointer",
        "w-full aspect-square",
        "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary",
        "border border-border/80 dark:border-zinc-800/80",
        !isSelected && !isMultiSelected && !isGreen && !isRed && !isSameValue && !isSameRow && !isSameCol && !isSameBox && "bg-card hover:bg-secondary/40",
        !isSelected && !isMultiSelected && !isGreen && !isRed && !isSameValue && (isSameRow || isSameCol) && "bg-primary/5 dark:bg-primary/10",
        !isSelected && !isMultiSelected && !isGreen && !isRed && !isSameValue && isSameBox && "bg-primary/5 dark:bg-primary/10",
        isSameValue && !isSelected && "bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold",
        isUnitCell && !isSameRow && !isSameCol && !isSameBox && "bg-amber-500/5 dark:bg-amber-500/10",
        isSelected && "!bg-primary/10 dark:!bg-primary/20 z-10 ring-2.5 ring-inset ring-primary dark:ring-primary",
        isMultiSelected && "!bg-amber-500/10 dark:!bg-amber-500/20 ring-2.5 ring-inset ring-amber-500/60 dark:ring-amber-500/60 z-10",
        cell.conflict && "!bg-destructive/15 dark:!bg-destructive/20 !text-destructive",
        cell.given
          ? "text-foreground font-extrabold"
          : cell.value
            ? solved
              ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
              : "text-primary dark:text-primary-foreground/90 font-extrabold"
            : "text-muted-foreground",
        isGreen && "bg-emerald-500/10! dark:bg-emerald-500/20! ring-2.5 ring-inset ring-emerald-500",
        isRed && "!bg-destructive/10 dark:!bg-destructive/20 ring-2.5 ring-inset ring-destructive",
      )}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
        fontSize: hasCandidates ? "inherit" : undefined,
        ...(isRightBorder ? { borderRightWidth: 2.5, borderRightColor: "var(--grid-thick)" } : {}),
        ...(isBottomBorder ? { borderBottomWidth: 2.5, borderBottomColor: "var(--grid-thick)" } : {}),
      } as React.CSSProperties}
    >
      {cell.value ? (
        <span className="text-[clamp(15px,4vw,24px)] leading-none select-none font-mono font-bold">{cell.value}</span>
      ) : hasCandidates ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
            const isEliminated = elimMap.has(`${idx}-${d}`);
            return (
              <span
                key={d}
                className={cn(
                  "flex items-center justify-center text-[clamp(8px,1.8vw,11px)] leading-none relative select-none font-medium",
                  cell.candidates.has(d) && !isEliminated && "text-slate-600 dark:text-zinc-300",
                  cell.candidates.has(d) && isEliminated && "text-red-500 dark:text-red-400",
                  !cell.candidates.has(d) && "text-transparent",
                )}
              >
                {cell.candidates.has(d) ? d : "."}
                {isEliminated && cell.candidates.has(d) && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-full h-0.5 bg-red-500 dark:bg-red-400 rotate-135 absolute" />
                    <span className="w-full h-0.5 bg-red-500 dark:bg-red-400 rotate-45 absolute" />
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ) : null}
      {!cell.value && cell.centerMarks.size > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="flex items-center gap-[1px] text-[clamp(11px,2.4vw,15px)] leading-none font-medium text-indigo-500 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-sm px-[2px]">
            {[...cell.centerMarks].sort().join("")}
          </span>
        </div>
      )}
      {cell.colors.length > 0 && (
        <span className="absolute inset-0 rounded-[3px] pointer-events-none overflow-hidden" style={cell.colors.length === 1 ? { backgroundColor: cell.colors[0], opacity: 0.25 } : undefined}>
          {cell.colors.length === 1 ? null : (
            <>
              <span className="absolute inset-0" style={{ background: cell.colors[0], opacity: 0.25, clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
              <span className="absolute inset-0" style={{ background: cell.colors[1], opacity: 0.25, clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />
              {cell.colors.length > 2 && (
                <span className="absolute bottom-0 right-0 text-[6px] leading-none font-bold px-[1px] text-white bg-slate-800/60 rounded-tl-[2px] select-none">+{cell.colors.length - 2}</span>
              )}
            </>
          )}
        </span>
      )}
      {cageInfo && (
        <>
          {cageInfo.sum !== null && (
            <span className="absolute top-[1px] left-[2px] text-[9px] leading-none font-bold pointer-events-none z-20">{cageInfo.sum}</span>
          )}
          {cageInfo.top && <div className="absolute top-0 left-0 right-0 h-0 pointer-events-none z-10 cage-border" style={{ borderTop: `1.5px dashed ${CAGE_BORDER}` }} />}
          {cageInfo.bottom && <div className="absolute bottom-0 left-0 right-0 h-0 pointer-events-none z-10 cage-border" style={{ borderBottom: `1.5px dashed ${CAGE_BORDER}` }} />}
          {cageInfo.left && <div className="absolute top-0 left-0 bottom-0 w-0 pointer-events-none z-10 cage-border" style={{ borderLeft: `1.5px dashed ${CAGE_BORDER}` }} />}
          {cageInfo.right && <div className="absolute top-0 right-0 bottom-0 w-0 pointer-events-none z-10 cage-border" style={{ borderRight: `1.5px dashed ${CAGE_BORDER}` }} />}
        </>
      )}
    </button>
  );
});

interface SudokuGridProps {
  cells: CellState[];
  selectedIndex: number | null;
  multiSelectedIndices?: Set<number>;
  onCellClick: (index: number, e: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  onCellPointerDown?: (index: number) => void;
  onCellPointerUp?: () => void;
  inputMode?: InputMode;
  hintHighlights?: HintHighlights | null;
  highlights?: Set<number>;
  removalHighlights?: Set<number>;
  proofCells?: Set<number>;
  solved?: boolean;
  cages?: Cage[];
  variant?: string;
  constraints?: VariantConstraints;
}

export function SudokuGrid({
  cells,
  selectedIndex,
  multiSelectedIndices,
  onCellClick,
  onKeyDown,
  onCellPointerDown,
  onCellPointerUp,
  inputMode,
  hintHighlights,
  highlights,
  removalHighlights,
  proofCells,
  solved = false,
  cages,
  variant,
  constraints,
}: SudokuGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current && !gridRef.current.contains(document.activeElement)) {
      gridRef.current.focus();
    }
  }, [cells]);

  const selectedValue: CellValue =
    selectedIndex !== null ? (cells[selectedIndex]?.value ?? null) : null;

  const sameValueCells = useMemo(() => {
    if (selectedValue === null) return new Set<number>();
    const set = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (cells[i]?.value === selectedValue && i !== selectedIndex && !multiSelectedIndices?.has(i)) {
        set.add(i);
      }
    }
    return set;
  }, [cells, selectedValue, selectedIndex, multiSelectedIndices]);

  const greenSet = useMemo(() => {
    const s = new Set(hintHighlights?.greenCells ?? []);
    if (highlights) for (const h of highlights) s.add(h);
    if (proofCells) for (const p of proofCells) s.add(p);
    return s;
  }, [hintHighlights, highlights, proofCells]);
  const redSet = useMemo(() => {
    const s = new Set(hintHighlights?.redCells ?? []);
    if (removalHighlights) for (const r of removalHighlights) s.add(r);
    return s;
  }, [hintHighlights, removalHighlights]);
  const unitSet = useMemo(() => {
    return new Set(hintHighlights?.unitCells ?? []);
  }, [hintHighlights]);

  const cageInfoMap = useMemo(() => cages ? computeCageInfo(cages) : null, [cages]);

  const elimMap = useMemo(() => {
    const map = new Map<string, true>();
    for (const e of hintHighlights?.eliminationCandidates ?? []) {
      map.set(`${e.cellIndex}-${e.digit}`, true);
    }
    return map;
  }, [hintHighlights]);

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      role="grid"
      aria-label="Sudoku Board Grid"
      onKeyDown={onKeyDown ?? undefined}
      className="w-full max-w-[min(500px,calc(100vw-32px),55dvh)] lg:max-w-[min(650px,70dvh)] mx-auto focus:outline-none"
    >
      <div
        className="grid border-[2.5px] rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_35px_rgba(0,0,0,0.4)] border-border bg-card relative"
        style={{
          gridTemplateColumns: "repeat(9, 1fr)",
          gridTemplateRows: "repeat(9, 1fr)",
          borderColor: "var(--grid-thick)",
        }}
      >
        {Array.from({ length: 81 }, (_, i) => {
          const cell = cells[i];
          if (!cell) return null;
          const row = Math.floor(i / 9);
          const col = i % 9;
          return (
            <CellButton
              key={i}
              cell={cell}
              index={i}
              selectedIndex={selectedIndex}
              isMultiSelected={selectedIndex !== i && (multiSelectedIndices?.has(i) ?? false)}
              isSameValue={sameValueCells.has(i)}
              isSameRow={selectedIndex !== null && Math.floor(selectedIndex / 9) === row}
              isSameCol={selectedIndex !== null && selectedIndex % 9 === col}
              isSameBox={selectedIndex !== null && Math.floor(Math.floor(selectedIndex / 9) / 3) === Math.floor(row / 3) && Math.floor((selectedIndex % 9) / 3) === Math.floor(col / 3)}
              isGreen={greenSet.has(i)}
              isRed={redSet.has(i)}
              isUnitCell={unitSet.has(i) && !greenSet.has(i) && !redSet.has(i)}
              elimMap={elimMap}
              cageInfo={cageInfoMap?.get(i)}
              onCellClick={onCellClick}
              onCellPointerDown={onCellPointerDown}
              onCellPointerUp={onCellPointerUp}
              solved={solved}
            />
          );
        })}
        {variant === "xsudoku" && (
          <svg
            className="absolute inset-0 pointer-events-none z-20"
            style={{ width: "100%", height: "100%" }}
            viewBox="0 0 9 9"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="0" x2="9" y2="9" stroke="#d97706" strokeWidth="0.04" strokeDasharray="0.12 0.08" opacity="0.5" />
            <line x1="9" y1="0" x2="0" y2="9" stroke="#d97706" strokeWidth="0.04" strokeDasharray="0.12 0.08" opacity="0.5" />
          </svg>
        )}
        {variant === "hyper" && (
          <svg
            className="absolute inset-0 pointer-events-none z-20"
            style={{ width: "100%", height: "100%" }}
            viewBox="0 0 9 9"
            preserveAspectRatio="none"
          >
            {[
              [[1, 1], [1, 3], [3, 1], [3, 3]], // TL, TR, BL, BR of grid-relative 3x3
              [[5, 1], [5, 3], [7, 1], [7, 3]],
              [[1, 5], [1, 7], [3, 5], [3, 7]],
              [[5, 5], [5, 7], [7, 5], [7, 7]],
            ].map(([[r1, c1], [r2, c2], [r3, c3], [r4, c4]], i) => (
              <rect
                key={i}
                x={c1}
                y={r1}
                width={3}
                height={3}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="0.06"
                strokeDasharray="0.1 0.06"
                opacity="0.4"
                rx="0.1"
              />
            ))}
          </svg>
        )}
        {constraints && (() => {
          const el: React.ReactNode[] = [];
          let ek = 0;
          const cx = (idx: number) => (idx % 9) + 0.5;
          const cy = (idx: number) => Math.floor(idx / 9) + 0.5;
          const mx = (a: number, b: number) => ((a % 9) + (b % 9) + 1) / 2;
          const my = (a: number, b: number) => (Math.floor(a / 9) + Math.floor(b / 9) + 1) / 2;

          if (constraints.palindromeLines) {
            for (const line of constraints.palindromeLines) {
              const pts = line.map(i => `${cx(i)},${cy(i)}`).join(" ");
              el.push(<polyline key={`pal-${ek++}`} points={pts} fill="none" stroke="#8b5cf6" strokeWidth="0.055" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />);
            }
          }

          if (constraints.thermos) {
            for (const th of constraints.thermos) {
              if (th.length < 2) continue;
              const pts = th.map(i => `${cx(i)},${cy(i)}`).join(" ");
              el.push(<polyline key={`th-${ek++}`} points={pts} fill="none" stroke="#ef4444" strokeWidth="0.055" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />);
              el.push(<circle key={`thb-${ek++}`} cx={cx(th[0])} cy={cy(th[0])} r="0.14" fill="#ef4444" opacity="0.55" />);
            }
          }

          if (constraints.renbanLines) {
            for (const line of constraints.renbanLines) {
              const pts = line.map(i => `${cx(i)},${cy(i)}`).join(" ");
              el.push(<polyline key={`ren-${ek++}`} points={pts} fill="none" stroke="#10b981" strokeWidth="0.055" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />);
            }
          }

          if (constraints.arrows) {
            for (const arr of constraints.arrows) {
              if (arr.path.length === 0) continue;
              el.push(<circle key={`ac-${ek++}`} cx={cx(arr.circle)} cy={cy(arr.circle)} r="0.22" fill="none" stroke="#f59e0b" strokeWidth="0.055" opacity="0.55" />);
              const all = [arr.circle, ...arr.path];
              const pts = all.map(i => `${cx(i)},${cy(i)}`).join(" ");
              el.push(<polyline key={`al-${ek++}`} points={pts} fill="none" stroke="#f59e0b" strokeWidth="0.055" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />);
              const e = all[all.length - 1], p = all.length >= 2 ? all[all.length - 2] : arr.circle;
              const dx = cx(e) - cx(p), dy = cy(e) - cy(p);
              const ln = Math.sqrt(dx * dx + dy * dy);
              if (ln > 0) {
                const ux = dx / ln, uy = dy / ln;
                const s = 0.22, c = Math.cos(Math.PI / 6), s30 = Math.sin(Math.PI / 6);
                const p1x = cx(e) - s * (ux * c - uy * s30);
                const p1y = cy(e) - s * (uy * c + ux * s30);
                const p2x = cx(e) - s * (ux * c + uy * s30);
                const p2y = cy(e) - s * (uy * c - ux * s30);
                el.push(<polygon key={`ah-${ek++}`} points={`${cx(e)},${cy(e)} ${p1x},${p1y} ${p2x},${p2y}`} fill="#f59e0b" opacity="0.55" />);
              }
            }
          }

          if (constraints.kropkiDots) {
            for (const dot of constraints.kropkiDots) {
              el.push(<circle key={`kd-${ek++}`} cx={mx(dot.a, dot.b)} cy={my(dot.a, dot.b)} r="0.08" fill={dot.kind === "black" ? "#1e293b" : "#ffffff"} stroke={dot.kind === "black" ? "none" : "#64748b"} strokeWidth="0.02" opacity="0.8" />);
            }
          }

          if (constraints.xvPairs) {
            for (const pair of constraints.xvPairs) {
              el.push(<text key={`xv-${ek++}`} x={mx(pair.a, pair.b)} y={my(pair.a, pair.b)} textAnchor="middle" dominantBaseline="central" fill="#059669" fontSize="0.22" fontWeight="bold" opacity="0.7" style={{ fontFamily: "serif" }}>{pair.kind.toUpperCase()}</text>);
            }
          }

          if (constraints.greaterThan) {
            for (const [a, b] of constraints.greaterThan) {
              const h = Math.floor(a / 9) === Math.floor(b / 9);
              const aLeft = (a % 9) < (b % 9);
              const aUp = Math.floor(a / 9) < Math.floor(b / 9);
              let ch: string;
               if (h) ch = aLeft ? ">" : "<";
              else ch = aUp ? "∨" : "∧";
              el.push(<text key={`gt-${ek++}`} x={mx(a, b)} y={my(a, b)} textAnchor="middle" dominantBaseline="central" fill="#7c3aed" fontSize="0.18" fontWeight="bold" opacity="0.7" style={{ fontFamily: "serif" }}>{ch}</text>);
            }
          }

          return (
            <svg className="absolute inset-0 pointer-events-none z-20" style={{ width: "100%", height: "100%" }} viewBox="0 0 9 9" preserveAspectRatio="none">
              {el}
            </svg>
          );
        })()}
      </div>
    </div>
  );
}
