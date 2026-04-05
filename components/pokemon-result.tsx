import Image from "next/image";

interface PokemonResultProps {
  pokemon: {
    pokedexNumber: number;
    name: string;
    sprite: string;
    types: string[];
    generation: number;
    flavorText: string;
    height: number; // in decimetres
    weight: number; // in hectograms
    evolutionChain: string[];
  };
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-[#A8A77A]",
  fire: "bg-[#EE8130]",
  water: "bg-[#6390F0]",
  electric: "bg-[#F7D02C]",
  grass: "bg-[#7AC74C]",
  ice: "bg-[#96D9D6]",
  fighting: "bg-[#C22E28]",
  poison: "bg-[#A33EA1]",
  ground: "bg-[#E2BF65]",
  flying: "bg-[#A98FF3]",
  psychic: "bg-[#F95587]",
  bug: "bg-[#A6B91A]",
  rock: "bg-[#B6A136]",
  ghost: "bg-[#735797]",
  dragon: "bg-[#6F35FC]",
  dark: "bg-[#705746]",
  steel: "bg-[#B7B7CE]",
  fairy: "bg-[#D685AD]",
};

const ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
};

const REGIONS: Record<number, string> = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
  10: "Paldea", // Gen 10 defaults to Paldea for now
};

function toRoman(n: number): string {
  return ROMAN[n] ?? String(n);
}

function getRegion(gen: number): string {
  return REGIONS[gen] ?? "Unknown";
}

export function PokemonResult({ pokemon }: PokemonResultProps) {
  const {
    pokedexNumber,
    name,
    sprite,
    types,
    generation,
    flavorText,
    height,
    weight,
    evolutionChain,
  } = pokemon;

  // Convert measurements
  const heightInMeters = (height / 10).toFixed(1); // decimetres to metres
  const weightInKg = (weight / 10).toFixed(1); // hectograms to kg

  // Capitalize name
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-pokered p-6 space-y-4">
      {/* Header with Sprite */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <Image
            src={sprite}
            alt={displayName}
            fill
            className="object-contain"
            priority
          />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{displayName}</h2>
        <p className="text-slate-500 font-mono">
          #{pokedexNumber.toString().padStart(3, "0")}
        </p>
      </div>

      {/* Type Badges */}
      <div className="flex gap-2 justify-center">
        {types.map((type) => (
          <span
            key={type}
            className={`${
              TYPE_COLORS[type] || "bg-slate-400"
            } text-white px-4 py-1 rounded-full font-semibold text-sm uppercase`}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Generation */}
      <div className="text-center text-slate-600 font-medium">
        Gen {toRoman(generation)} · {getRegion(generation)}
      </div>

      {/* Flavor Text */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <p className="text-slate-700 italic text-center leading-relaxed">
          {flavorText}
        </p>
      </div>

      {/* Height & Weight */}
      <div className="flex justify-center gap-8 text-slate-600">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">Height</p>
          <p className="text-lg font-bold">{heightInMeters}m</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">Weight</p>
          <p className="text-lg font-bold">{weightInKg}kg</p>
        </div>
      </div>

      {/* Evolution Chain */}
      {evolutionChain.length > 1 && (
        <div>
          <p className="text-sm font-medium text-slate-500 text-center mb-2">
            Evolution Chain
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {evolutionChain.map((evoName, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    evoName.toLowerCase() === name.toLowerCase()
                      ? "bg-pokered text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {evoName}
                </span>
                {index < evolutionChain.length - 1 && (
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
