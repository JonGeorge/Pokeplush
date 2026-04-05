"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { HeroSection } from "./hero-section";
import { TabNav } from "./tab-nav";
import { FilterSidebar } from "./filter-sidebar";
import { SearchBar } from "./search-bar";
import { PokemonGrid } from "./pokemon-grid";
import type { PokemonWithStatus } from "@/lib/db/queries";

// Tap cycle: none → wanted → collected → none
const STATUS_CYCLE: Record<string, string> = {
  none: "wanted",
  wanted: "collected",
  collected: "none",
};

export function CollectionView({
  initialPokemon,
  initialCollectedCount,
  initialTrusted,
}: {
  initialPokemon: PokemonWithStatus[];
  initialCollectedCount: number;
  initialTrusted: boolean;
}) {
  const [pokemonMap, setPokemonMap] = useState<Map<number, string>>(() => {
    const map = new Map<number, string>();
    for (const p of initialPokemon) {
      map.set(p.pokedexNumber, p.status);
    }
    return map;
  });
  const [trusted, setTrusted] = useState(initialTrusted);
  const pendingRequests = useRef(new Map<number, AbortController>());

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedGens, setSelectedGens] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  // Derive available generations and types from the data
  const generations = useMemo(() => {
    const set = new Set<number>();
    for (const p of initialPokemon) set.add(p.generation);
    return Array.from(set).sort((a, b) => a - b);
  }, [initialPokemon]);

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialPokemon) {
      for (const t of p.types) set.add(t);
    }
    return Array.from(set).sort();
  }, [initialPokemon]);

  // Total collected count — always reflects full dataset, not filtered
  const collectedCount = useMemo(() => {
    let count = 0;
    for (const status of pokemonMap.values()) {
      if (status === "collected") count++;
    }
    return count;
  }, [pokemonMap]);

  // Build full pokemon list with current statuses
  const allPokemon = useMemo(
    () =>
      initialPokemon.map((p) => ({
        ...p,
        status: pokemonMap.get(p.pokedexNumber) ?? "none",
      })),
    [initialPokemon, pokemonMap]
  );

  // Filtered pokemon
  const filteredPokemon = useMemo(() => {
    const q = search.toLowerCase();
    return allPokemon.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (selectedGens.size > 0 && !selectedGens.has(p.generation)) return false;
      if (selectedTypes.size > 0 && !p.types.some((t) => selectedTypes.has(t))) return false;
      // Tab filtering
      if (activeTab === "wishlist" && p.status !== "wanted") return false;
      if (activeTab === "collection" && p.status !== "collected") return false;
      return true;
    });
  }, [allPokemon, search, selectedGens, selectedTypes, activeTab]);

  const handleGenChange = useCallback((gen: number | "all") => {
    if (gen === "all") {
      setSelectedGens(new Set());
    } else {
      setSelectedGens((prev) => {
        const next = new Set(prev);
        if (next.has(gen)) {
          next.delete(gen);
        } else {
          next.add(gen);
        }
        return next;
      });
    }
  }, []);

  const handleTypeChange = useCallback((type: string | "all") => {
    if (type === "all") {
      setSelectedTypes(new Set());
    } else {
      setSelectedTypes((prev) => {
        const next = new Set(prev);
        if (next.has(type)) {
          next.delete(type);
        } else {
          next.add(type);
        }
        return next;
      });
    }
  }, []);

  const handleToggle = useCallback(
    async (pokedexNumber: number) => {
      if (!trusted) return;

      const prevStatus = pokemonMap.get(pokedexNumber) ?? "none";
      const nextStatus = STATUS_CYCLE[prevStatus] ?? "wanted";

      setPokemonMap((prev) => {
        const next = new Map(prev);
        next.set(pokedexNumber, nextStatus);
        return next;
      });

      const existing = pendingRequests.current.get(pokedexNumber);
      if (existing) existing.abort();

      const controller = new AbortController();
      pendingRequests.current.set(pokedexNumber, controller);

      try {
        const res = await fetch("/api/collection/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pokedexNumber }),
          signal: controller.signal,
        });

        if (res.status === 401) {
          setTrusted(false);
          setPokemonMap((prev) => {
            const next = new Map(prev);
            next.set(pokedexNumber, prevStatus);
            return next;
          });
          return;
        }

        if (!res.ok) {
          setPokemonMap((prev) => {
            const next = new Map(prev);
            next.set(pokedexNumber, prevStatus);
            return next;
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setPokemonMap((prev) => {
          const next = new Map(prev);
          next.set(pokedexNumber, prevStatus);
          return next;
        });
      } finally {
        pendingRequests.current.delete(pokedexNumber);
      }
    },
    [trusted, pokemonMap]
  );

  return (
    <div className="bg-white min-h-screen" suppressHydrationWarning>
      {/* Hero */}
      <HeroSection collectedCount={collectedCount} allPokemon={allPokemon} />

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Two-column layout: sidebar + content */}
      <div className="flex">
        {/* Left sidebar filters */}
        <FilterSidebar
          generations={generations}
          types={types}
          selectedGens={selectedGens}
          selectedTypes={selectedTypes}
          onGenChange={handleGenChange}
          onTypeChange={handleTypeChange}
        />

        {/* Right content area */}
        <main className="flex-1 flex flex-col gap-6 py-6 px-4 sm:px-6 md:pl-0 md:pr-16">
          <SearchBar value={search} onChange={setSearch} />

          {filteredPokemon.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-body text-lg text-muted">
                {search
                  ? `No Pokémon found for "${search}"`
                  : activeTab === "wishlist"
                    ? "No Pokémon on your wishlist"
                    : activeTab === "collection"
                      ? "No Pokémon in your collection"
                      : "No Pokémon match these filters"}
              </p>
            </div>
          ) : (
            <PokemonGrid
              pokemon={filteredPokemon}
              editable={trusted}
              onToggle={handleToggle}
            />
          )}
        </main>
      </div>
    </div>
  );
}
