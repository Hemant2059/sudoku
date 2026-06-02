import { NextRequest, NextResponse } from "next/server";
import { generateKillerPuzzle } from "@/lib/engine";

export async function GET() {
  try {
    const result = generateKillerPuzzle();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = generateKillerPuzzle();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}
