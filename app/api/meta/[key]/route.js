import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";

export const runtime = "nodejs";

const ALLOWED_KEYS = new Set(["chatHistory", "comparisons"]);

export async function GET(req, { params }) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ALLOWED_KEYS.has(params.key)) {
          return NextResponse.json({ error: "Unknown key." }, { status: 400 });
    }

  await ensureSchema();
    const { rows } = await sql`
        SELECT value FROM user_meta WHERE user_id = ${user.sub} AND key = ${params.key}
          `;
    return NextResponse.json({ value: rows[0]?.value ?? [] });
}

export async function PUT(req, { params }) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ALLOWED_KEYS.has(params.key)) {
          return NextResponse.json({ error: "Unknown key." }, { status: 400 });
    }

  let body;
    try {
          body = await req.json();
    } catch {
          return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

  await ensureSchema();
    await sql`
        INSERT INTO user_meta (user_id, key, value)
            VALUES (${user.sub}, ${params.key}, ${JSON.stringify(body?.value ?? [])}::jsonb)
                ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value
                  `;
    return NextResponse.json({ ok: true });
}
