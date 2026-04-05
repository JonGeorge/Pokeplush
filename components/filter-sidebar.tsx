"use client";

function CheckboxItem({
  label,
  checked,
  isAll,
  onChange,
}: {
  label: string;
  checked: boolean;
  isAll?: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex gap-3 items-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {checked ? (
        <svg className="w-5 h-5 text-pokeblue shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <rect width="20" height="20" rx="4" />
          <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-dark/30 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="3.25" />
        </svg>
      )}
      <span
        className={`font-body text-[16px] text-dark ${
          checked ? "font-bold" : "font-normal"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export function FilterSidebar({
  generations,
  types,
  selectedGens,
  selectedTypes,
  onGenChange,
  onTypeChange,
}: {
  generations: number[];
  types: string[];
  selectedGens: Set<number>;
  selectedTypes: Set<string>;
  onGenChange: (gen: number | "all") => void;
  onTypeChange: (type: string | "all") => void;
}) {
  const allGensSelected = selectedGens.size === 0;
  const allTypesSelected = selectedTypes.size === 0;

  return (
    <aside className="hidden md:block w-[299px] shrink-0 pl-16 pr-[52px] py-6 overflow-y-auto">
      {/* Generations */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading font-extrabold text-[20px] text-pokeblue tracking-[-1px]">
          GENERATIONS
        </h3>
        <CheckboxItem
          label="All Generations"
          checked={allGensSelected}
          isAll
          onChange={() => onGenChange("all")}
        />
        {generations.map((gen) => (
          <CheckboxItem
            key={gen}
            label={`Gen ${gen}`}
            checked={selectedGens.has(gen)}
            onChange={() => onGenChange(gen)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="my-7 h-px bg-[#d9d9d9]" />

      {/* Types */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading font-extrabold text-[20px] text-pokeblue tracking-[-1px]">
          TYPES
        </h3>
        <CheckboxItem
          label="All Types"
          checked={allTypesSelected}
          isAll
          onChange={() => onTypeChange("all")}
        />
        {types.map((type) => (
          <CheckboxItem
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            checked={selectedTypes.has(type)}
            onChange={() => onTypeChange(type)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="my-7 h-px bg-[#d9d9d9]" />

      {/* Admin */}
      <a
        href="/admin"
        className="font-heading font-extrabold text-[20px] text-pokeblue tracking-[-1px] hover:text-pokeblue-light transition-colors"
      >
        ADMIN
      </a>
    </aside>
  );
}
