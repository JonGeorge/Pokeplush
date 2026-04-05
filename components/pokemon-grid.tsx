"use client";

import { PokemonCell, PokemonCellSkeleton } from "./pokemon-cell";
import type { PokemonWithStatus } from "@/lib/db/queries";

export function PokemonGrid({
  pokemon,
  editable,
  onToggle,
  loading,
}: {
  pokemon: PokemonWithStatus[];
  editable: boolean;
  onToggle?: (pokedexNumber: number) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(max(160px, calc((100% - 96px) / 5)), 1fr))" }}>
        {Array.from({ length: 15 }, (_, i) => (
          <PokemonCellSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(max(160px, calc((100% - 96px) / 5)), 1fr))" }}>
      {pokemon.map((p) => (
        <PokemonCell
          key={p.pokedexNumber}
          pokedexNumber={p.pokedexNumber}
          name={p.name}
          spriteUrl={p.spriteUrl}
          status={p.status}
          editable={editable}
          onTap={onToggle}
        />
      ))}
    </div>
  );
}
