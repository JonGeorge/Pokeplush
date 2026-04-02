## Task

Scaffold a new Next.js (App Router) project for a Pokémon plushie collection tracker. Set up the database schema, build a PokéAPI cache seeding script, and render the main grid view as a read-only page. This is the foundation — editing and auth come later.

## Product Context

This app is for a 10-year-old boy on the autism spectrum to celebrate his Pokémon stuffie (plushie) collection (~160 and growing). He uses it on an iPad in Safari. The UX must prioritize predictability, clarity, and low cognitive load — large tap targets, no layout shifts, no hover-dependent interactions.

Critical framing: this is NOT a completionist checklist. There should never be "160 / 493" or percentage counters. The collection counter should be purely celebratory — something like "🎉 160 Collected!" — celebrating what he HAS, not what's missing.

## Tech Stack

- Next.js (App Router) with TypeScript
- Tailwind CSS for styling
- Neon Postgres for the database (use @neondatabase/serverless driver)
- Drizzle ORM for schema and queries
- PokéAPI (https://pokeapi.co) for Pokémon data

## Database Schema

Two tables. Keep it simple — this is a single-user app with no users table.

**`pokemon`** — cached PokéAPI data:
- `pokedex_number` (integer, primary key)
- `name` (text, not null)
- `sprite_url` (text, not null)
- `generation` (integer, not null)
- `types` (text array, not null) — e.g., ["fire", "flying"]
- `cached_at` (timestamp with timezone, not null, default now)

**`collection`** — the user's collection state:
- `pokedex_number` (integer, primary key, foreign key to pokemon)
- `status` (text, not null, default 'none') — one of: 'collected', 'wanted', 'none'
- `updated_at` (timestamp with timezone, not null, default now)

## PokéAPI Cache Seeding

Build a standalone seeding script (e.g., `scripts/seed-pokemon.ts`) that:

1. Fetches all Pokémon from PokéAPI — specifically from `/api/v2/pokemon-species?limit=2000` to get the full list, then fetch individual species data to get generation info
2. For each Pokémon, gets: name, Pokédex number, sprite URL (use the official artwork from `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`), generation number (parse from generation URL like `https://pokeapi.co/api/v2/generation/1/`), and types (from `/api/v2/pokemon/{id}`)
3. Upserts all results into the `pokemon` table
4. Batches requests to be respectful of PokéAPI rate limits — no more than ~50 concurrent requests, with a small delay between batches
5. Logs progress as it runs (e.g., "Seeded 100/905 Pokémon...")
6. Can be re-run safely to refresh the cache (upsert, not insert)

Make the script runnable via `npx tsx scripts/seed-pokemon.ts` with the DATABASE_URL from .env.

## Main Page (Read-Only Grid)

Build the index page (`/`) showing all Pokémon in a grid, ordered by Pokédex number.

### Layout
- **Top section:** Collection counter ("🎉 X Collected!") in large, celebratory text. Below it, a fun visual progress indicator — something Pokémon-themed like a row of Pokéballs filling up or a simple colorful bar. This should feel rewarding, not like a task completion meter.
- **Grid:** All Pokémon in a responsive grid. Each cell shows the Pokémon's sprite image. Minimum cell size 80x80px for comfortable iPad tapping (editing comes later, but the grid should be built tap-ready from the start).

### Visual States for Grid Cells
- **Collected:** Full color, vibrant. Subtle colored border or soft glow to make these pop.
- **Wanted:** Full color but with a small star or heart badge in the corner.
- **None (default):** Greyed out / desaturated (CSS filter grayscale). Should be clearly "uncollected" but not ugly or depressing — these are still Pokémon, just ones he doesn't have yet.

### Performance
- This grid could have 900+ items. Use virtualized/windowed rendering OR a simple approach: render all items but lazy-load images (native `loading="lazy"` is fine). If you use virtualization, make sure scroll position is stable and the grid doesn't jump.
- Skeleton/placeholder states while images load — a simple pokéball silhouette or grey circle, not a layout shift.

### What NOT to Build Yet
- No search bar, no filters, no generation tabs (Prompt 3)
- No edit mode, no tapping to toggle status (Prompt 2)
- No setup/auth page (Prompt 2)
- No admin export/import (Prompt 3)

## Environment Variables

The app needs:
- `DATABASE_URL` — Neon Postgres connection string

Create a `.env.example` with these listed.

## Edge Cases
- If the `pokemon` table is empty (seeding hasn't run), show a friendly message: "No Pokémon data yet! Run the seed script to get started." — not an error page.
- If a sprite image fails to load, show a pokéball placeholder.
- The collection counter should show 0 gracefully: "🎉 0 Collected — your adventure begins!" or similar. Not "0 Collected!" which reads as sad.

## Design Direction
- Bright, clean, slightly playful. Think Pokémon-inspired but not garish.
- Use rounded corners, soft shadows, and a color palette that nods to Pokémon (reds, whites, blues) without going full brand-infringement.
- Typography should be clear and large — this is for a kid on an iPad.
- The page should feel joyful. This kid loves his collection.
