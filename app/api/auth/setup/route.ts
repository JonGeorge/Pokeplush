import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, buildCookieOptions } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body as { code?: string };

  if (!code || code !== process.env.SETUP_CODE) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const cookieValue = createSessionCookie();
  const opts = buildCookieOptions();

  const response = NextResponse.json({ success: true });
  response.cookies.set(opts.name, cookieValue, opts);
  return response;
}
