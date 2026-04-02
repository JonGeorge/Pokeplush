import { NextResponse } from "next/server";
import { isTrusted } from "@/lib/auth/session";
import { exportCollection } from "@/lib/db/queries";

export async function GET() {
  const trusted = await isTrusted();
  if (!trusted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await exportCollection();
  return NextResponse.json(data);
}
