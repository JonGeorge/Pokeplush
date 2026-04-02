import { db } from ".";
import { pokemon, collection } from "./schema";
import { asc, eq, sql, inArray } from "drizzle-orm";

export type PokemonWithStatus = {
  pokedexNumber: number;
  name: string;
  spriteUrl: string;
  generation: number;
  types: string[];
  status: string;
};

export async function getAllPokemonWithStatus(): Promise<PokemonWithStatus[]> {
  const rows = await db
    .select({
      pokedexNumber: pokemon.pokedexNumber,
      name: pokemon.name,
      spriteUrl: pokemon.spriteUrl,
      generation: pokemon.generation,
      types: pokemon.types,
      status: collection.status,
    })
    .from(pokemon)
    .leftJoin(collection, eq(pokemon.pokedexNumber, collection.pokedexNumber))
    .orderBy(asc(pokemon.pokedexNumber));

  return rows.map((row) => ({
    ...row,
    status: row.status ?? "none",
  }));
}

export async function getCollectedCount(): Promise<number> {
  const rows = await db
    .select({ pokedexNumber: collection.pokedexNumber })
    .from(collection)
    .where(eq(collection.status, "collected"));
  return rows.length;
}

const STATUS_CYCLE: Record<string, string> = {
  none: "collected",
  collected: "wanted",
  wanted: "none",
};

export async function togglePokemonStatus(
  pokedexNumber: number
): Promise<string> {
  // Get current status
  const rows = await db
    .select({ status: collection.status })
    .from(collection)
    .where(eq(collection.pokedexNumber, pokedexNumber));

  const currentStatus = rows.length > 0 ? rows[0].status : "none";
  const newStatus = STATUS_CYCLE[currentStatus] ?? "collected";

  if (newStatus === "none") {
    // Delete the row to keep the table clean
    await db
      .delete(collection)
      .where(eq(collection.pokedexNumber, pokedexNumber));
  } else {
    // Upsert the new status
    await db
      .insert(collection)
      .values({
        pokedexNumber,
        status: newStatus,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: collection.pokedexNumber,
        set: {
          status: newStatus,
          updatedAt: sql`now()`,
        },
      });
  }

  return newStatus;
}

export type CollectionExportEntry = {
  pokedexNumber: number;
  name: string;
  status: string;
};

export async function exportCollection(): Promise<CollectionExportEntry[]> {
  const rows = await db
    .select({
      pokedexNumber: collection.pokedexNumber,
      name: pokemon.name,
      status: collection.status,
    })
    .from(collection)
    .innerJoin(pokemon, eq(collection.pokedexNumber, pokemon.pokedexNumber))
    .where(inArray(collection.status, ["collected", "wanted"]))
    .orderBy(asc(collection.pokedexNumber));

  return rows;
}

export async function importCollection(
  entries: { pokedexNumber: number; status: string }[]
): Promise<{ imported: number; skipped: number }> {
  // Get valid pokedex numbers from the pokemon table
  const allPokemon = await db
    .select({ pokedexNumber: pokemon.pokedexNumber })
    .from(pokemon);
  const validIds = new Set(allPokemon.map((p) => p.pokedexNumber));

  let imported = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!validIds.has(entry.pokedexNumber)) {
      skipped++;
      continue;
    }

    if (entry.status === "none") {
      await db
        .delete(collection)
        .where(eq(collection.pokedexNumber, entry.pokedexNumber));
    } else {
      await db
        .insert(collection)
        .values({
          pokedexNumber: entry.pokedexNumber,
          status: entry.status,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: collection.pokedexNumber,
          set: {
            status: entry.status,
            updatedAt: sql`now()`,
          },
        });
    }
    imported++;
  }

  return { imported, skipped };
}
