import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "finsight_session";

function secretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
          throw new Error(
                  "JWT_SECRET is not set on the server. Add it to .env.local (or your Vercel project's environment variables) and restart."
                );
    }
    return new TextEncoder().encode(secret);
}

export function cookieOptions() {
    return {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
    };
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export async function signSession({ id, email }) {
    return new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(id)
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secretKey());
}

// Returns { sub, email } on a valid token, or null if missing/invalid/expired.
export async function verifySession(token) {
    if (!token) return null;
    try {
          const { payload } = await jwtVerify(token, secretKey());
          return payload;
    } catch {
          return null;
    }
}

// Reads the session cookie off a Next.js Request (App Router route handlers
// and middleware both expose `req.cookies.get(name)`), and verifies it.
// Returns { sub, email } or null.
export async function requireUser(req) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    return verifySession(token);
}
