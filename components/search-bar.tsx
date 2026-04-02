"use client";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Pokémon..."
        autoComplete="off"
        className="w-full min-h-[48px] px-4 pr-10 text-lg rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-pokeblue focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
