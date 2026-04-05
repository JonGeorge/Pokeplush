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

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-[31px] border-2 border-border bg-white/60 animate-skeleton">
      <div className="w-[100px] h-[100px] rounded-full bg-slate-200" />
      <div className="mt-2 w-20 h-4 rounded bg-slate-200" />
      <div className="mt-1 w-12 h-3 rounded bg-slate-200" />
    </div>
  );
}

export function PokemonCellSkeleton() {
  return <SkeletonCard />;
}

export function PokemonCell({
  pokedexNumber,
  name,
  spriteUrl,
  status,
  editable,
  onTap,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [tapping, setTapping] = useState(false);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCollected = status === "collected";
  const isWanted = status === "wanted";
  const isNone = !isCollected && !isWanted;

  const handleTap = useCallback(() => {
    if (!editable || !onTap) return;
    onTap(pokedexNumber);
    setTapping(true);
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setTapping(false), 250);
  }, [editable, onTap, pokedexNumber]);

  // Card styles per Figma states
  let cardBg = "bg-white/60";
  let cardBorder = "border-border";
  if (isWanted) {
    cardBg = "bg-[rgba(255,203,5,0.1)]";
    cardBorder = "border-pokeyellow";
  } else if (isCollected) {
    cardBg = "bg-[rgba(209,250,229,0.2)]";
    cardBorder = "border-emerald-600";
  }

  return (
    <div
      onClick={handleTap}
      className={`
        relative flex flex-col items-center justify-center
        p-2 sm:p-3 md:p-4 rounded-[20px] sm:rounded-[26px] md:rounded-[31px] border-2 overflow-hidden
        transition-all duration-200 select-none
        min-h-[120px] sm:min-h-[140px] md:min-h-[160px]
        ${cardBg} ${cardBorder}
        ${editable ? "cursor-pointer active:scale-95" : ""}
        ${tapping ? "animate-tap-pop" : ""}
      `}
    >
      {/* Status icon */}
      {isWanted && (
        <span className="absolute top-3 right-3 text-pokeyellow text-lg">★</span>
      )}
      {isCollected && (
        <span className="absolute top-3 right-3 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      {/* Sprite */}
      <div className="relative w-full aspect-square max-w-[100px]">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <img
            src={spriteUrl}
            alt={name}
            loading="lazy"
            width={100}
            height={100}
            draggable={false}
            className="w-full h-full object-contain transition-all duration-300"
            style={isCollected ? undefined : { filter: "grayscale(100%)", opacity: 0.4 }}
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgError(true); setImgLoading(false); }}
          />
        )}
      </div>

      {/* Name */}
      <span
        className={`font-body font-medium text-[12px] sm:text-[14px] md:text-[16px] leading-tight text-center mt-1 capitalize w-full ${
          isCollected ? "text-dark" : "text-muted"
        }`}
      >
        {name}
      </span>

      {/* Pokédex number */}
      <span className="font-body font-medium text-[11px] sm:text-[12px] md:text-[14px] leading-tight text-muted mt-1">
        #{String(pokedexNumber).padStart(4, "0")}
      </span>
    </div>
  );
}
