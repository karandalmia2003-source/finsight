import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql, ensureSchema } from "../../../../lib/db";
import { hashPassword, signSession, cookieOptions, SESSION_COOKIE } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
    let body;
    try {
          body = await req.json();
    } catch {
          return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

  const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
    if (password.length < 8) {
          return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

  try {
        await ensureSchema();
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existing.rows.length > 0) {
                return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

      const id = crypto.randomUUID();
        const passwordHash = await hashPassword(password);
        await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${passwordHash})`;

      const token = await signSession({ id, email });
        const res = NextResponse.json({ id, email });
        res.cookies.set(SESSION_COOKIE, token, cookieOptions());
        return res;
  } catch (err) {
        console.error("[/api/auth/signup]", err);
        return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}
