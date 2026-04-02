"use client";

import { PokemonCell } from "./pokemon-cell";
import type { PokemonWithStatus } from "@/lib/db/queries";

export function PokemonGrid({
  pokemon,
  editable,
  onToggle,
}: {
  pokemon: PokemonWithStatus[];
  editable: boolean;
  onToggle?: (pokedexNumber: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 px-4 pb-8">
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
