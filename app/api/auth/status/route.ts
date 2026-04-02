import { NextResponse } from "next/server";
import { isTrusted } from "@/lib/auth/session";

export async function GET() {
  const trusted = await isTrusted();
  return NextResponse.json({ trusted });
}
