import { NextRequest, NextResponse } from "next/server";
import { solveVariantPuzzle } from "@/lib/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const puzzle = body.puzzle as string;
    const variant = (body.variant as string) || "classic";
    const constraints = body.constraints as string | undefined;

    if (!puzzle || puzzle.length !== 81) {
      return NextResponse.json(
        { command: "error", data: { message: "Puzzle must be exactly 81 characters." } },
        { status: 400 }
      );
    }

    const result = solveVariantPuzzle(puzzle, variant, constraints);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { command: "error", data: { message: String(e.message || e) } },
      { status: 500 }
    );
  }
}
