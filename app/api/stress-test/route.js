import { NextResponse } from "next/server";
import { runStressTest } from "../../../lib/claude";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { assumption, extracted, brief } = body || {};
  if (!assumption || typeof assumption !== "string" || !assumption.trim()) {
    return NextResponse.json({ error: "Missing assumption text." }, { status: 400 });
  }
  if (!extracted) {
    return NextResponse.json({ error: "Missing document data." }, { status: 400 });
  }

  try {
    const result = await runStressTest(assumption.trim(), extracted, brief);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/stress-test] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to run stress test." },
      { status: 500 }
    );
  }
}
