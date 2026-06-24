import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function DELETE(req, { params }) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureSchema();
    await sql`DELETE FROM documents WHERE id = ${params.id} AND user_id = ${user.sub}`;
    return NextResponse.json({ ok: true });
}
