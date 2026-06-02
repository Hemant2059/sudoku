import { NextRequest, NextResponse } from "next/server";
import { generateVariantPuzzle } from "@/lib/engine";

export async function GET(request: NextRequest) {
  const variant = request.nextUrl.searchParams.get("variant") || "xsudoku";
  const difficulty = request.nextUrl.searchParams.get("difficulty") || "medium";
  try {
    const result = generateVariantPuzzle(variant, difficulty);
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
    const variant = body.variant || "xsudoku";
    const difficulty = body.difficulty || "medium";
    const result = generateVariantPuzzle(variant, difficulty);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}
