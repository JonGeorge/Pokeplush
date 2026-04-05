"use client";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Pokémon..."
        autoComplete="off"
        className="w-full px-6 py-3 text-[16px] font-body rounded-[16px] border border-border bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-pokeblue/30 focus:border-pokeblue/50 placeholder:text-search-placeholder"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark text-lg p-1"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
