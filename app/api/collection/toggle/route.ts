import { NextRequest, NextResponse } from "next/server";
import { isTrusted } from "@/lib/auth/session";
import { togglePokemonStatus } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const trusted = await isTrusted();
  if (!trusted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pokedexNumber } = body as { pokedexNumber?: number };

  if (typeof pokedexNumber !== "number") {
    return NextResponse.json({ error: "Invalid pokedexNumber" }, { status: 400 });
  }

  const newStatus = await togglePokemonStatus(pokedexNumber);
  return NextResponse.json({ pokedexNumber, status: newStatus });
}
