import { NextResponse } from "next/server";
import { isTrusted } from "@/lib/auth/session";
import { refreshPokemonCache } from "@/lib/pokeapi/seed";

export async function POST() {
  const trusted = await isTrusted();
  if (!trusted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshPokemonCache();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 300;
