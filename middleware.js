import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "finsight_session";
const PUBLIC_API_PATHS = new Set(["/api/auth/login", "/api/auth/signup"]);

async function hasValidSession(req) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    try {
          await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
          return true;
    } catch {
          return false;
    }
}

export async function middleware(req) {
    const { pathname } = req.nextUrl;

  if (PUBLIC_API_PATHS.has(pathname)) {
        return NextResponse.next();
  }

  const valid = await hasValidSession(req);
    if (valid) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/", "/api/:path*"],
};
