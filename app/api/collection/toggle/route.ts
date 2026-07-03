import { NextRequest, NextResponse } from "next/server";
import { isTrusted } from "@/lib/auth/session";
import { togglePokemonStatus } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const trusted = await isTrusted();
  if (!trusted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { pokedexNumber } = body as { pokedexNumber?: number };

  if (
    typeof pokedexNumber !== "number" ||
    !Number.isInteger(pokedexNumber) ||
    pokedexNumber < 1
  ) {
    return NextResponse.json({ error: "Invalid pokedexNumber" }, { status: 400 });
  }

  const newStatus = await togglePokemonStatus(pokedexNumber);
  return NextResponse.json({ pokedexNumber, status: newStatus });
}
