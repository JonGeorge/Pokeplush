"use client";

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

function toRoman(n: number): string {
  return ROMAN[n] ?? String(n);
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-[#A8A77A] text-white",
  fire: "bg-[#EE8130] text-white",
  water: "bg-[#6390F0] text-white",
  electric: "bg-[#F7D02C] text-gray-800",
  grass: "bg-[#7AC74C] text-white",
  ice: "bg-[#96D9D6] text-gray-800",
  fighting: "bg-[#C22E28] text-white",
  poison: "bg-[#A33EA1] text-white",
  ground: "bg-[#E2BF65] text-gray-800",
  flying: "bg-[#A98FF3] text-white",
  psychic: "bg-[#F95587] text-white",
  bug: "bg-[#A6B91A] text-white",
  rock: "bg-[#B6A136] text-white",
  ghost: "bg-[#735797] text-white",
  dragon: "bg-[#6F35FC] text-white",
  dark: "bg-[#705746] text-white",
  steel: "bg-[#B7B7CE] text-gray-800",
  fairy: "bg-[#D685AD] text-white",
};

function Pill({
  label,
  selected,
  onClick,
  colorClass,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  colorClass?: string;
}) {
  const base =
    "shrink-0 min-h-[44px] px-4 rounded-full font-medium text-sm transition-all duration-150 border-2 select-none";

  if (selected && colorClass) {
    return (
      <button onClick={onClick} className={`${base} ${colorClass} border-transparent shadow-sm`}>
        {label}
      </button>
    );
  }

  if (selected) {
    return (
      <button onClick={onClick} className={`${base} bg-pokeblue text-white border-pokeblue shadow-sm`}>
        {label}
      </button>
    );
  }

  return (
    <button onClick={onClick} className={`${base} bg-white text-slate-600 border-slate-200 hover:border-slate-300`}>
      {label}
    </button>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {children}
    </div>
  );
}

export function GenerationFilter({
  generations,
  selected,
  onChange,
}: {
  generations: number[];
  selected: number | null;
  onChange: (gen: number | null) => void;
}) {
  return (
    <ScrollRow>
      <Pill label="All" selected={selected === null} onClick={() => onChange(null)} />
      {generations.map((gen) => (
        <Pill
          key={gen}
          label={`Gen ${toRoman(gen)}`}
          selected={selected === gen}
          onClick={() => onChange(gen)}
        />
      ))}
    </ScrollRow>
  );
}

export function TypeFilter({
  types,
  selected,
  onChange,
}: {
  types: string[];
  selected: string | null;
  onChange: (type: string | null) => void;
}) {
  return (
    <ScrollRow>
      <Pill label="All Types" selected={selected === null} onClick={() => onChange(null)} />
      {types.map((type) => (
        <Pill
          key={type}
          label={type.charAt(0).toUpperCase() + type.slice(1)}
          selected={selected === type}
          onClick={() => onChange(type)}
          colorClass={TYPE_COLORS[type]}
        />
      ))}
    </ScrollRow>
  );
}

export function StatusFilter({
  selected,
  onChange,
}: {
  selected: "all" | "collected" | "wanted";
  onChange: (status: "all" | "collected" | "wanted") => void;
}) {
  const options: { value: "all" | "collected" | "wanted"; label: string }[] = [
    { value: "all", label: "Show All" },
    { value: "collected", label: "My Collection" },
    { value: "wanted", label: "Wishlist" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`shrink-0 min-h-[44px] px-4 rounded-lg font-medium text-sm transition-all duration-150 border-2 select-none ${
              isSelected
                ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
