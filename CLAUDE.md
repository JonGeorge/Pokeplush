# Pokémon Stuffie Tracker

A single-user web app for a 10-year-old boy (on the autism spectrum) to track his Pokémon plushie collection. The primary user is on an iPad in Safari. The parent handles setup and admin.

## Tech Stack

- Next.js (App Router) on Vercel
- Neon Postgres (via `@neondatabase/serverless`)
- Tailwind CSS
- PokéAPI (https://pokeapi.co) for Pokémon data, cached in the database

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (run before pushing)
- `npm run lint` — ESLint
- `npx drizzle-kit push` — push schema changes to Neon
- `npx drizzle-kit studio` — browse database locally

## Architecture

```
/app              → pages and layouts (App Router)
/app/api          → API routes (all mutations require session validation)
/components       → React components (client components only where interactivity is needed)
/lib/db           → Drizzle schema, connection, queries
/lib/auth         → session cookie validation helpers
/lib/pokeapi      → PokéAPI fetch + cache logic
```

## Database

Two tables in Neon Postgres, managed with Drizzle ORM:

- `pokemon` — cached PokéAPI data: pokedex_number (PK), name, sprite_url, generation, types (text[]), cached_at
- `collection` — user state: pokedex_number (PK, FK → pokemon), status (enum: collected/wanted/none), updated_at

Single-user app. No users table.

## Auth Model

No login system. Device trust via session cookie:

1. Parent enters `SETUP_CODE` (Vercel env var) at `/setup`
2. Server sets a long-lived HTTP-only cookie → device is "trusted"
3. Trusted device = edit mode (tap to toggle Pokémon status)
4. No cookie = read-only browse mode (no error shown, just no edit capability)
5. Every API mutation route must validate the session cookie before writing

Do NOT add WebAuthn, passkeys, biometrics, or device fingerprinting.

## Critical UX Rules

The primary user is a 10-year-old on the spectrum. These are non-negotiable:

- **Celebratory framing only.** The counter says "160 Collected!" — never "160 / 493" or any fraction/percentage. No sense of incompletion.
- **Tap cycles status immediately.** `none → collected → wanted → none`. No confirmation dialogs. No "are you sure?" prompts. Ever.
- **Visual feedback on every tap.** Bounce, scale, or color animation so the interaction feels unambiguous.
- **Big tap targets.** Grid cells minimum 60×60px. Touch-optimized, no hover-dependent interactions.
- **No layout shifts.** The grid, counter, and filters must not jump as data loads. Use skeleton/placeholder states.
- **Read-only is silent.** Untrusted visitors see the collection but tapping does nothing — no error messages, no "you can't edit" toasts.

## Pokémon Display States

- **Collected:** full-color sprite, visually prominent (subtle glow or border)
- **Wanted:** distinct indicator (star or heart icon overlay)
- **None/default:** greyed out or desaturated

## Environment Variables

```
DATABASE_URL=         # Neon Postgres connection string
SETUP_CODE=           # parent-chosen code for device trust
SESSION_SECRET=       # secret for signing session cookies
```

## Gotchas

- PokéAPI has rate limits — cache aggressively, batch initial data population, never call it on every page load
- Safari on iPad has quirks with `position: fixed` and viewport height — test scroll behavior on actual device
- Infinite scroll must lazy-load images — loading 1000+ sprites at once will crash the tab
- The app must work without PokéAPI being available (serve from DB cache)
- Drizzle `push` is for dev; use `migrate` for production schema changes
