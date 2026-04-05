"use client";

import { useMemo } from "react";
import type { PokemonWithStatus } from "@/lib/db/queries";

function selectSpritePool(pokemon: PokemonWithStatus[], count: number) {
  if (pokemon.length === 0) return [];
  const step = Math.max(1, Math.floor(pokemon.length / count));
  const pool: PokemonWithStatus[] = [];
  for (let i = 0; pool.length < count && i < pokemon.length; i += step) {
    pool.push(pokemon[i]);
  }
  return pool;
}

// Row masks: true = sprite, false = spacer
// Original mirrored pattern + 1 extra sprite per side
// All rows 23 slots. Row 0: 10 sprites, Rows 1-3: 8 sprites
const ROW_MASKS: boolean[][] = [
  // S_S_S_S_S_______S_S_S_S_S  (5 left, 7 spacers, 5 right)
  [true,false,true,false,true,false,true,false,true,false,false,false,false,false,true,false,true,false,true,false,true,false,true],
  // _S_S_S_S_________S_S_S_S_  (4 left, 7 spacers, 4 right)
  [false,true,false,true,false,true,false,true,false,false,false,false,false,false,false,true,false,true,false,true,false,true,false],
  // S_S_S_S___________S_S_S_S  (4 left, 7 spacers, 4 right)
  [true,false,true,false,true,false,true,false,false,false,false,false,false,false,false,false,true,false,true,false,true,false,true],
  // _S_S_S_S_________S_S_S_S_  (4 left, 7 spacers, 4 right)
  [false,true,false,true,false,true,false,true,false,false,false,false,false,false,false,true,false,true,false,true,false,true,false],
];

function SpriteRow({
  sprites,
  rowIndex,
  mask,
}: {
  sprites: PokemonWithStatus[];
  rowIndex: number;
  mask: boolean[];
}) {
  let spriteIdx = 0;

  return (
    <div className="flex items-center justify-between" style={{ minWidth: 1560 }}>
      {mask.map((showSprite, slotIdx) => {
        if (showSprite && spriteIdx < sprites.length) {
          const p = sprites[spriteIdx++];
          const rotation = (slotIdx + rowIndex) % 2 === 0 ? -8 : 8;
          return (
            <div
              key={`${rowIndex}-${slotIdx}`}
              className="shrink-0 flex items-center justify-center"
              style={{ width: 68, height: 68 }}
            >
              <div style={{ transform: `rotate(${rotation}deg)` }}>
                <img
                  src={p.spriteUrl}
                  alt=""
                  width={60}
                  height={60}
                  loading="lazy"
                  draggable={false}
                  className="w-[60px] h-[60px] object-contain pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0";
                  }}
                />
              </div>
            </div>
          );
        }
        return (
          <div
            key={`${rowIndex}-s-${slotIdx}`}
            className="shrink-0"
            style={{ width: 60, height: 60 }}
          />
        );
      })}
    </div>
  );
}

export function HeroSection({
  collectedCount,
  allPokemon,
}: {
  collectedCount: number;
  allPokemon: PokemonWithStatus[];
}) {
  const spriteRows = useMemo(() => {
    const totalSprites = ROW_MASKS.flat().filter(Boolean).length;
    const pool = selectSpritePool(allPokemon, totalSprites);
    const rows: PokemonWithStatus[][] = [];
    let offset = 0;
    for (const mask of ROW_MASKS) {
      const count = mask.filter(Boolean).length;
      rows.push(pool.slice(offset, offset + count));
      offset += count;
    }
    return rows;
  }, [allPokemon]);

  return (
    <section className="relative bg-pokeblue w-full h-[512px] overflow-hidden">
      {/* Background sprite pattern — centered, clips at edges, hidden on small screens */}
      <div className="absolute inset-0 hidden sm:flex flex-col gap-[54px] pt-10 pointer-events-none items-center">
        {spriteRows.map((row, i) => (
          <SpriteRow key={i} sprites={row} rowIndex={i} mask={ROW_MASKS[i]} />
        ))}
      </div>

      {/* POKÉPLUSH logo */}
      <p className="absolute top-8 left-1/2 -translate-x-1/2 font-heading font-extrabold text-[24px] text-pokeyellow tracking-[-1px] leading-[56px] whitespace-nowrap z-10">
        POKÉPLUSH
      </p>

      {/* Collected count — responsive text sizing */}
      <div className="absolute top-[160px] left-1/2 -translate-x-1/2 flex flex-col items-center text-white text-center tracking-[-1px] z-10 pb-4">
        <p className="font-heading font-normal text-[185px] leading-none">
          {collectedCount}
        </p>
        <p className="font-heading font-normal text-[48px] leading-none">
          collected!
        </p>
      </div>
    </section>
  );
}
