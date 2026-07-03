import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSessionCookie, buildCookieOptions } from "@/lib/auth/session";

function codeMatches(code: string, expected: string): boolean {
  // Hash both sides so timingSafeEqual gets equal-length buffers
  const a = crypto.createHash("sha256").update(code).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { code } = body as { code?: string };

  const expected = process.env.SETUP_CODE;
  if (!expected || typeof code !== "string" || !codeMatches(code, expected)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const cookieValue = createSessionCookie();
  const opts = buildCookieOptions();

  const response = NextResponse.json({ success: true });
  response.cookies.set(opts.name, cookieValue, opts);
  return response;
}
