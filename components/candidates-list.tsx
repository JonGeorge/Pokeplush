import Image from "next/image";

interface PokemonData {
  pokedexNumber: number;
  name: string;
  sprite: string;
  types: string[];
  generation: number;
  flavorText: string;
  height: number;
  weight: number;
  evolutionChain: string[];
}

interface CandidatesListProps {
  candidates: PokemonData[];
  featured: PokemonData;
  onSelect: (pokemon: PokemonData) => void;
}

export function CandidatesList({
  candidates,
  featured,
  onSelect,
}: CandidatesListProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-min">
        {candidates.map((pokemon) => {
          const isFeatured = pokemon.pokedexNumber === featured.pokedexNumber;
          const displayName =
            pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

          return (
            <button
              key={pokemon.pokedexNumber}
              onClick={() => !isFeatured && onSelect(pokemon)}
              className={`relative shrink-0 w-[100px] bg-white rounded-lg border-2 p-3 transition-all min-h-[44px] ${
                isFeatured
                  ? "border-pokered opacity-60 cursor-default"
                  : "border-slate-200 hover:border-pokeblue hover:shadow-md cursor-pointer"
              }`}
            >
              {/* Checkmark for featured */}
              {isFeatured && (
                <div className="absolute top-1 right-1 bg-pokered rounded-full p-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Sprite */}
              <div className="relative w-full aspect-square mb-2">
                <Image
                  src={pokemon.sprite}
                  alt={displayName}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Name */}
              <p className="text-xs font-semibold text-slate-700 text-center truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 text-center font-mono">
                #{pokemon.pokedexNumber.toString().padStart(3, "0")}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
