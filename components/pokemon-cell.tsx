"use client";

import { useState, useRef, useCallback } from "react";

type Props = {
  pokedexNumber: number;
  name: string;
  spriteUrl: string;
  status: string;
  editable: boolean;
  onTap?: (pokedexNumber: number) => void;
};

export function PokemonCell({
  pokedexNumber,
  name,
  spriteUrl,
  status,
  editable,
  onTap,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const [tapping, setTapping] = useState(false);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCollected = status === "collected";
  const isWanted = status === "wanted";

  const handleTap = useCallback(() => {
    if (!editable || !onTap) return;

    onTap(pokedexNumber);

    // Trigger bounce animation
    setTapping(true);
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setTapping(false), 200);
  }, [editable, onTap, pokedexNumber]);

  return (
    <div
      onClick={handleTap}
      className={`
        relative flex flex-col items-center justify-center
        rounded-xl p-2 transition-all duration-200
        min-w-[80px] min-h-[80px] select-none
        ${editable ? "cursor-pointer active:scale-95" : ""}
        ${tapping ? "scale-110" : ""}
        ${isCollected ? "bg-white shadow-md collected-glow border-2 border-pokered/30" : ""}
        ${isWanted ? "bg-white shadow-sm border-2 border-pokeyellow/50" : ""}
        ${!isCollected && !isWanted ? "bg-slate-100 border border-slate-200" : ""}
      `}
      style={{
        transition: tapping
          ? "transform 0.1s ease-out"
          : "transform 0.2s ease-out, box-shadow 0.2s, background-color 0.2s, border-color 0.2s",
      }}
    >
      {/* Wanted badge */}
      {isWanted && (
        <span className="absolute top-0.5 right-0.5 text-sm leading-none">
          ⭐
        </span>
      )}

      {/* Sprite */}
      {imgError ? (
        <div className="w-14 h-14 flex items-center justify-center text-2xl opacity-40">
          ●
        </div>
      ) : (
        <img
          src={spriteUrl}
          alt={name}
          loading="lazy"
          width={56}
          height={56}
          draggable={false}
          className={`w-14 h-14 object-contain transition-all duration-200 ${
            !isCollected && !isWanted ? "grayscale opacity-40" : ""
          }`}
          onError={() => setImgError(true)}
        />
      )}

      {/* Name */}
      <span
        className={`text-[10px] leading-tight text-center mt-1 capitalize truncate w-full ${
          !isCollected && !isWanted ? "text-slate-400" : "text-slate-700"
        }`}
      >
        {name}
      </span>

      {/* Pokédex number */}
      <span className="text-[9px] text-slate-400">
        #{String(pokedexNumber).padStart(3, "0")}
      </span>
    </div>
  );
}
