export const NUM_CELLS = 81;
export const NUM_DIGITS = 9;
export const ALL_CANDIDATES = 0b111111111;

export type CellIdx = number;
export type Digit = number;
export type CandidateMask = number;

export function digitToBit(d: Digit): CandidateMask {
  return 1 << (d - 1);
}

export function bitToDigit(bit: CandidateMask): Digit | null {
  if (bit === 0) return null;
  let n = 0;
  let b = bit;
  while ((b & 1) === 0) { n++; b >>>= 1; }
  return n + 1;
}

export function cellRow(idx: CellIdx): number {
  return Math.floor(idx / 9);
}

export function cellCol(idx: CellIdx): number {
  return idx % 9;
}

export function cellBox(idx: CellIdx): number {
  return Math.floor(cellRow(idx) / 3) * 3 + Math.floor(cellCol(idx) / 3);
}

export function rcIdx(row: number, col: number): CellIdx {
  return row * 9 + col;
}

export function isRCRelated(a: CellIdx, b: CellIdx): boolean {
  return a === b || cellRow(a) === cellRow(b) || cellCol(a) === cellCol(b) || cellBox(a) === cellBox(b);
}

export class Grid {
  cells: CandidateMask[];

  constructor(cells?: CandidateMask[]) {
    if (cells) {
      this.cells = [...cells];
    } else {
      this.cells = new Array(81).fill(ALL_CANDIDATES);
    }
  }

  static fromString(s: string): Grid {
    const cleaned = s.replace(/\s/g, "");
    if (cleaned.length !== 81) {
      throw new Error(`Puzzle must have exactly 81 characters, got ${cleaned.length}`);
    }
    const grid = new Grid();
    for (let i = 0; i < 81; i++) {
      const ch = cleaned[i];
      if (ch === "." || ch === "0") continue;
      const d = parseInt(ch, 10);
      if (d < 1 || d > 9) {
        throw new Error(`Invalid character '${ch}' at position ${i}`);
      }
      grid.setValue(i, d);
    }
    return grid;
  }

  toString(): string {
    let s = "";
    for (let i = 0; i < 81; i++) {
      const v = this.value(i);
      s += v !== null ? String(v) : ".";
    }
    return s;
  }

  display(): string {
    let s = "";
    for (let r = 0; r < 9; r++) {
      if (r % 3 === 0 && r !== 0) s += "------+-------+------\n";
      for (let c = 0; c < 9; c++) {
        if (c % 3 === 0 && c !== 0) s += "| ";
        const idx = rcIdx(r, c);
        const v = this.value(idx);
        s += v !== null ? String(v) : ".";
        s += " ";
      }
      s += "\n";
    }
    return s;
  }

  value(idx: CellIdx): Digit | null {
    const mask = this.cells[idx];
    if (mask === 0 || (mask & (mask - 1)) !== 0) return null;
    return bitToDigit(mask);
  }

  candidates(idx: CellIdx): CandidateMask {
    return this.cells[idx];
  }

  isSolved(): boolean {
    return this.cells.every(m => m !== 0 && (m & (m - 1)) === 0);
  }

  setValue(idx: CellIdx, digit: Digit): void {
    const mask = digitToBit(digit);
    this.cells[idx] = mask;
    const elimMask = ~mask & ALL_CANDIDATES;
    const row = cellRow(idx);
    const col = cellCol(idx);
    const box = cellBox(idx);

    for (let i = 0; i < 9; i++) {
      const rIdx = rcIdx(row, i);
      if (rIdx !== idx) this.cells[rIdx] &= elimMask;
      const cIdx = rcIdx(i, col);
      if (cIdx !== idx) this.cells[cIdx] &= elimMask;
    }
    const br = Math.floor(box / 3) * 3;
    const bc = (box % 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        const bIdx = rcIdx(r, c);
        if (bIdx !== idx) this.cells[bIdx] &= elimMask;
      }
    }
  }

  eliminate(idx: CellIdx, digit: Digit): boolean {
    const mask = digitToBit(digit);
    const old = this.cells[idx];
    const n = old & ~mask;
    if (old !== n) {
      this.cells[idx] = n;
      return true;
    }
    return false;
  }

  isCandidate(idx: CellIdx, digit: Digit): boolean {
    return (this.cells[idx] & digitToBit(digit)) !== 0;
  }

  copyFrom(other: Grid): void {
    for (let i = 0; i < 81; i++) this.cells[i] = other.cells[i];
  }

  clone(): Grid {
    return new Grid([...this.cells]);
  }

  countRemaining(): number {
    return this.cells.filter(m => m === 0 || (m & (m - 1)) !== 0).length;
  }
}

export function rowCells(row: number): number[] {
  const start = row * 9;
  return Array.from({ length: 9 }, (_, i) => start + i);
}

export function colCells(col: number): number[] {
  return Array.from({ length: 9 }, (_, i) => i * 9 + col);
}

export function boxCells(box: number): number[] {
  const startRow = Math.floor(box / 3) * 3;
  const startCol = (box % 3) * 3;
  const result: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      result.push(rcIdx(startRow + r, startCol + c));
    }
  }
  return result;
}

export function unitsForCell(idx: CellIdx): number[][] {
  return [
    rowCells(cellRow(idx)),
    colCells(cellCol(idx)),
    boxCells(cellBox(idx)),
  ];
}

export function allUnits(): number[][] {
  const units: number[][] = [];
  for (let i = 0; i < 9; i++) {
    units.push(rowCells(i));
    units.push(colCells(i));
    units.push(boxCells(i));
  }
  return units;
}

export function cellName(idx: CellIdx): string {
  return `R${cellRow(idx) + 1}C${cellCol(idx) + 1}`;
}

export function parseCellName(name: string): CellIdx {
  const match = name.match(/R(\d+)C(\d+)/);
  if (!match) throw new Error(`Invalid cell name: ${name}`);
  return rcIdx(parseInt(match[1]) - 1, parseInt(match[2]) - 1);
}
