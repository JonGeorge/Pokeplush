## Task

Add a device trust system and edit mode to the Pokémon stuffie tracker. This enables the parent to "trust" the iPad by entering a setup code, after which tapping Pokémon cells cycles their collection status. Without a trusted session, the grid is read-only.

## Product Context

This is a single-user family app. There are no accounts or logins. The parent sets a SETUP_CODE as an environment variable during deployment. On the kid's iPad, the parent visits /setup once, enters the code, and the device gets a long-lived session cookie. From then on, the kid can tap to collect. If the cookie is ever cleared, the parent re-enters the code — takes 10 seconds.

Read-only visitors (anyone without the cookie) can browse the grid but tapping cells does nothing. No error messages, no "you can't edit" toasts, no locked icons. The grid just doesn't respond to taps. The experience should be identical visually — the only difference is interactivity.

## How the Session Works

1. New env var: `SETUP_CODE` — a short alphanumeric code the parent chooses (e.g., "pokefan2024")
2. `POST /api/auth/setup` — accepts `{ code: string }`. If it matches SETUP_CODE, set a long-lived HTTP-only secure cookie (e.g., `stuffie_session`, 1 year expiry) with a random token value. Store that token somewhere you can validate it — a simple approach is to sign it with a secret or just check a hash. Return 200 on success, 401 on wrong code.
3. `GET /api/auth/status` — returns `{ trusted: true/false }` based on whether the request has a valid session cookie.
4. All mutation API routes (next step) must validate the session cookie before processing. Return 401 if missing/invalid.

Keep it simple. Don't use NextAuth, Better Auth, or any auth library. This is a cookie + env var check.

## Setup Page (`/setup`)

A simple, friendly page at `/setup`:

- A heading like "Parent Setup" or "Trust This Device"
- A single text input for the setup code
- A submit button
- On success: redirect to `/` (the grid)
- On wrong code: show a brief inline error like "That code didn't work — try again" (not an alert/dialog)
- If the device is already trusted, show a message like "This device is already set up! ✅" with a link back to the grid
- This page doesn't need to be pretty or kid-friendly — only the parent sees it

## Edit Mode

When the device is trusted (session cookie present):

### Edit Mode Indicator
- Show a small, subtle indicator somewhere fixed on the page — like a pencil icon or a small "✏️ Edit Mode" pill in the bottom-right corner
- It should be noticeable enough that the parent can confirm editing is active, but not distracting for the kid during normal use
- Read-only visitors do not see this indicator at all

### Tapping to Cycle Status
- Tapping a Pokémon cell cycles its status: `none` → `collected` → `wanted` → `none`
- Each tap immediately updates the visual state (optimistic update) and fires a request to persist the change
- API route: `POST /api/collection/toggle` — accepts `{ pokedexNumber: number }`, reads current status from the DB, advances to the next status in the cycle, upserts into the collection table. Returns the new status.
- The collection counter at the top updates live when status changes (increment/decrement collected count)

### Tap Feedback
This is critical for the target user. Every tap must produce clear, satisfying, unambiguous feedback:
- A brief scale animation (cell pops up to ~110% then settles back) on every tap
- The visual state change (color/grayscale/badge) should happen instantly, not after the network round-trip
- If the network request fails, revert the optimistic update and DON'T show an error toast — just snap back to the previous state. The kid doesn't need to know about network errors. If he taps again it'll retry.
- No confirmation dialogs, ever. Tap = toggle. Undo = tap again.

## Architecture Notes

- The grid is currently a server component. You'll need to convert PokemonGrid and PokemonCell to client components (or add a client wrapper) to handle tap events and optimistic state.
- The collection counter also needs to become reactive (or be inside the same client boundary) so it updates on toggle.
- Keep the initial data fetch as a server component — pass the data down as props to the client grid.
- Check `app/page.tsx` and the existing component structure to understand what's already built.

## Environment Variables

Add to `.env.example`:
- `SETUP_CODE` — the parent-chosen device trust code

## Edge Cases
- Rapid tapping: if the kid taps the same cell 5 times fast, each tap should cycle the status forward. Queue or debounce the API calls but always keep the UI state ahead of the network. The displayed status after 5 rapid taps should be deterministic (5 taps from `none` = `wanted` → `none` → `collected` → `wanted` → `none`... so 5 from none = `wanted`).
- Tapping different cells quickly: each cell manages its own state independently. Tapping Pikachu then Charizard immediately should work for both.
- If the session cookie expires or is cleared mid-session, the next API call will return 401. On 401, the grid should quietly drop out of edit mode (hide the edit indicator, stop responding to taps). No error message — the parent will notice and re-enter the code.
- Don't create a collection row for status `none` — if cycling back to `none`, delete the row from the collection table (or skip the upsert). Keep the table clean.

## What NOT to Build Yet
- No search, no filters, no generation tabs (Prompt 3)
- No admin export/import (Prompt 3)
- No detail view on tap for read-only visitors (future)
