import { NextRequest, NextResponse } from "next/server";
import { verifySolution } from "@/lib/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puzzle, solution } = body;
    if (!puzzle || puzzle.length !== 81) {
      return NextResponse.json(
        { command: "error", data: { message: "Puzzle must be 81 characters" } },
        { status: 400 }
      );
    }
    if (!solution || solution.length !== 81) {
      return NextResponse.json(
        { command: "error", data: { message: "Solution must be 81 characters" } },
        { status: 400 }
      );
    }
    const result = verifySolution(puzzle, solution);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}
