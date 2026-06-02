import { NextRequest, NextResponse } from "next/server";
import { gradePuzzle } from "@/lib/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const puzzle = body.puzzle;
    if (!puzzle || puzzle.length !== 81) {
      return NextResponse.json(
        { command: "error", data: { message: "Puzzle must be 81 characters" } },
        { status: 400 }
      );
    }
    const result = gradePuzzle(puzzle);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}
