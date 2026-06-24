import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
    const user = await requireUser(req);
    if (!user) {
          return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    return NextResponse.json({ id: user.sub, email: user.email });
}
