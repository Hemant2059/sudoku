import { NextRequest, NextResponse } from "next/server";
import { generatePuzzle } from "@/lib/engine";
import type { GenerationResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const difficulty = request.nextUrl.searchParams.get("difficulty") || "medium";
  try {
    const result = generatePuzzle(difficulty as any);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const difficulty = body.difficulty || "medium";
    const result = generatePuzzle(difficulty as any);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}
