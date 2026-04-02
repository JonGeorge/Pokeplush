"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { CollectionCounter } from "./collection-counter";
import { PokeballProgress } from "./pokeball-progress";
import { SearchBar } from "./search-bar";
import { GenerationFilter, TypeFilter, StatusFilter } from "./filter-pills";
import { PokemonGrid } from "./pokemon-grid";
import type { PokemonWithStatus } from "@/lib/db/queries";

const STATUS_CYCLE: Record<string, string> = {
  none: "collected",
  collected: "wanted",
  wanted: "none",
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
  const [genFilter, setGenFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "collected" | "wanted">("all");

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
      if (genFilter !== null && p.generation !== genFilter) return false;
      if (typeFilter !== null && !p.types.includes(typeFilter)) return false;
      if (statusFilter === "collected" && p.status !== "collected") return false;
      if (statusFilter === "wanted" && p.status !== "wanted") return false;
      return true;
    });
  }, [allPokemon, search, genFilter, typeFilter, statusFilter]);

  const handleToggle = useCallback(
    async (pokedexNumber: number) => {
      if (!trusted) return;

      const prevStatus = pokemonMap.get(pokedexNumber) ?? "none";
      const nextStatus = STATUS_CYCLE[prevStatus] ?? "collected";

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

  const hasActiveFilters = search || genFilter !== null || typeFilter !== null || statusFilter !== "all";

  return (
    <>
      {/* Scrollable header */}
      <CollectionCounter count={collectedCount} />
      <PokeballProgress collected={collectedCount} total={initialPokemon.length} />

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm pt-2 pb-3 px-4 space-y-2 border-b border-slate-200/60">
        <SearchBar value={search} onChange={setSearch} />
        <GenerationFilter generations={generations} selected={genFilter} onChange={setGenFilter} />
        <TypeFilter types={types} selected={typeFilter} onChange={setTypeFilter} />
        <div className="pt-1 border-t border-slate-200/60">
          <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>

      {/* Grid or empty state */}
      {filteredPokemon.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg text-slate-500">
            {search
              ? `No Pokémon found for "${search}"`
              : "No Pokémon match these filters"}
          </p>
        </div>
      ) : (
        <div className="pt-3">
          <PokemonGrid
            pokemon={filteredPokemon}
            editable={trusted}
            onToggle={handleToggle}
          />
        </div>
      )}

      {trusted && <EditModeIndicator />}
    </>
  );
}

function EditModeIndicator() {
  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-slate-200 z-50">
      ✏️ Edit Mode
    </div>
  );
}
