import { NextResponse } from "next/server";
import { extractFinancialData, generateBrief } from "../../../lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { base64, filename } = body || {};
  if (!base64 || !filename) {
    return NextResponse.json(
      { error: "Missing file data. Expected { base64, filename }." },
      { status: 400 }
    );
  }

  try {
    const extracted = await extractFinancialData(base64, filename);
    const brief = await generateBrief(extracted);
    return NextResponse.json({ extracted, brief });
  } catch (err) {
    console.error("[/api/analyze] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to analyze document." },
      { status: 500 }
    );
  }
}
