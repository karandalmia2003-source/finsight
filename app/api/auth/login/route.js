import { NextResponse } from "next/server";
import { sql, ensureSchema } from "../../../../lib/db";
import { verifyPassword, signSession, cookieOptions, SESSION_COOKIE } from "../../../../lib/auth";

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
    if (!email || !password) {
          return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

  try {
        await ensureSchema();
        const { rows } = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
        const user = rows[0];
        if (!user) {
                return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
        }
        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
                return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
        }

      const token = await signSession({ id: user.id, email: user.email });
        const res = NextResponse.json({ id: user.id, email: user.email });
        res.cookies.set(SESSION_COOKIE, token, cookieOptions());
        return res;
  } catch (err) {
        console.error("[/api/auth/login]", err);
        return NextResponse.json({ error: "Failed to sign in. Please try again." }, { status: 500 });
  }
}
