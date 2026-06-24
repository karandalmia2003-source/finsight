import { NextResponse } from "next/server";
import { detectEarningsSurprise } from "../../../lib/claude";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { extracted } = body || {};
  if (!extracted) {
    return NextResponse.json({ error: "Missing document data." }, { status: 400 });
  }

  try {
    const result = await detectEarningsSurprise(extracted);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/surprise] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to run earnings surprise check." },
      { status: 500 }
    );
  }
}
