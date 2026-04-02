import { NextRequest, NextResponse } from "next/server";
import { isTrusted } from "@/lib/auth/session";
import { importCollection } from "@/lib/db/queries";

type ImportEntry = {
  pokedexNumber: number;
  status: string;
};

function validateImportData(data: unknown): ImportEntry[] | null {
  if (!Array.isArray(data)) return null;

  const entries: ImportEntry[] = [];
  for (const item of data) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).pokedexNumber !== "number" ||
      typeof (item as Record<string, unknown>).status !== "string"
    ) {
      return null;
    }
    const status = (item as Record<string, unknown>).status as string;
    if (!["collected", "wanted", "none"].includes(status)) return null;
    entries.push({
      pokedexNumber: (item as Record<string, unknown>).pokedexNumber as number,
      status,
    });
  }

  return entries;
}

export async function POST(request: NextRequest) {
  const trusted = await isTrusted();
  if (!trusted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entries = validateImportData(body);
  if (!entries) {
    return NextResponse.json(
      { error: "Invalid format. Expected an array of {pokedexNumber, status} objects." },
      { status: 400 }
    );
  }

  const result = await importCollection(entries);
  return NextResponse.json(result);
}
