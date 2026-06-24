import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";

export const runtime = "nodejs";

// Mirrors the old IndexedDB "documents" store, just scoped to the signed-in
// user. Each row's `data` column holds the exact same document object the
// client used to keep in IndexedDB (id, name, uploadedAt, extracted, brief,
// stressTests, surprise), so the client-side shape never has to change.

export async function GET(req) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureSchema();
    const { rows } = await sql`
        SELECT data FROM documents WHERE user_id = ${user.sub} ORDER BY updated_at ASC
          `;
    return NextResponse.json({ documents: rows.map((r) => r.data) });
}

// Upsert: used both to create a brand-new document and to save updates to
// an existing one (e.g. appending a stress-test result), matching the old
// storage.js saveDocument(doc) semantics exactly.
export async function POST(req) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
    try {
          body = await req.json();
    } catch {
          return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const doc = body?.document;
    if (!doc || !doc.id) {
          return NextResponse.json({ error: "Missing document." }, { status: 400 });
    }

  await ensureSchema();
    await sql`
        INSERT INTO documents (id, user_id, data, updated_at)
            VALUES (${doc.id}, ${user.sub}, ${JSON.stringify(doc)}::jsonb, now())
                ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
                    WHERE documents.user_id = ${user.sub}
                      `;
    return NextResponse.json({ ok: true });
}
