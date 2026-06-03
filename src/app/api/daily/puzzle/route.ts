import { NextResponse } from "next/server";
import { generateDailyPuzzle } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = generateDailyPuzzle();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { command: "error", data: { message: String(e) } },
      { status: 500 }
    );
  }
}
