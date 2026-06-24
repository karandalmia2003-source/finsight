import { NextResponse } from "next/server";
import { compareDocuments } from "../../../lib/claude";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
    let body;
    try {
          body = await req.json();
    } catch {
          return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { metrics, docs } = body || {};
    if (!Array.isArray(metrics) || metrics.length === 0) {
          return NextResponse.json({ error: "Missing comparison metrics." }, { status: 400 });
    }
    if (!Array.isArray(docs) || docs.length < 2) {
          return NextResponse.json({ error: "Select at least two documents to compare." }, { status: 400 });
    }

    try {
          const result = await compareDocuments(metrics, docs);
          return NextResponse.json(result);
    } catch (err) {
          console.error("[/api/compare] error:", err);
          return NextResponse.json(
            { error: err?.message || "Failed to compare documents." },
            { status: 500 }
                );
    }
}

