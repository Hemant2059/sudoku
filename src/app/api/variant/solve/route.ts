import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "child_process";

const BINARY_PATH = process.env.SODUKO_BIN || "/Users/hemant/Desktop/soduko/target/release/soduko";

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

    const args = ["--variant-solve", puzzle, variant];
    if (constraints) {
      args.push(constraints);
    }
    const raw = execFileSync(BINARY_PATH, args, { encoding: "utf-8", timeout: 30000 });
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { command: "error", data: { message: String(e.message || e) } },
      { status: 500 }
    );
  }
}
