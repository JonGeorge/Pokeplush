import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pokemon } from "../lib/db/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Create a .env file with your Neon connection string.");
  process.exit(1);
}

const client = neon(DATABASE_URL);
const db = drizzle(client);

const BATCH_SIZE = 50;
const DELAY_MS = 500;

type SpeciesListEntry = { name: string; url: string };
type PokemonInsert = typeof pokemon.$inferInsert;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseGenerationNumber(url: string): number {
  const match = url.match(/\/generation\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
}

function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchSpeciesList(): Promise<SpeciesListEntry[]> {
  console.log("Fetching species list from PokéAPI...");
  const data = await fetchJson<{ results: SpeciesListEntry[] }>(
    "https://pokeapi.co/api/v2/pokemon-species?limit=2000"
  );
  console.log(`Found ${data.results.length} species.`);
  return data.results;
}

async function fetchPokemonData(
  speciesUrl: string
): Promise<PokemonInsert | null> {
  try {
    const species = await fetchJson<{
      id: number;
      name: string;
      generation: { url: string };
    }>(speciesUrl);

    const id = species.id;
    const generation = parseGenerationNumber(species.generation.url);

    const pokemonData = await fetchJson<{
      types: { type: { name: string } }[];
    }>(`https://pokeapi.co/api/v2/pokemon/${id}`);

    const types = pokemonData.types.map((t) => t.type.name);

    return {
      pokedexNumber: id,
      name: species.name,
      spriteUrl: spriteUrl(id),
      generation,
      types,
    };
  } catch (err) {
    console.warn(`  Skipping ${speciesUrl}: ${err}`);
    return null;
  }
}

async function upsertBatch(rows: PokemonInsert[]) {
  if (rows.length === 0) return;
  await db
    .insert(pokemon)
    .values(rows)
    .onConflictDoUpdate({
      target: pokemon.pokedexNumber,
      set: {
        name: sql`excluded.name`,
        spriteUrl: sql`excluded.sprite_url`,
        generation: sql`excluded.generation`,
        types: sql`excluded.types`,
        cachedAt: sql`now()`,
      },
    });
}

async function main() {
  console.log("Starting PokéAPI seed...\n");

  const speciesList = await fetchSpeciesList();
  let seeded = 0;
  let skipped = 0;

  for (let i = 0; i < speciesList.length; i += BATCH_SIZE) {
    const batch = speciesList.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map((s) => fetchPokemonData(s.url))
    );

    const valid = results.filter((r): r is PokemonInsert => r !== null);
    await upsertBatch(valid);

    seeded += valid.length;
    skipped += results.length - valid.length;
    console.log(`Seeded ${seeded}/${speciesList.length} Pokémon...`);

    if (i + BATCH_SIZE < speciesList.length) {
      await delay(DELAY_MS);
    }
  }

  console.log(`\nDone! Seeded ${seeded} Pokémon. Skipped ${skipped}.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
