import { NextResponse } from "next/server";
import { chatWithDocuments } from "../../../lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, documents } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages." }, { status: 400 });
  }
  if (!Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json(
      { error: "Upload at least one document before chatting." },
      { status: 400 }
    );
  }

  try {
    const result = await chatWithDocuments(messages, documents);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/chat] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to get a response." },
      { status: 500 }
    );
  }
}
