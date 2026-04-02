"use client";

/**
 * A row of Pokéballs that fill in based on how many Pokémon are collected.
 * Each ball represents a chunk of the collection. Filled balls are red,
 * unfilled are grey. Purely celebratory — no fractions or totals shown.
 */
export function PokeballProgress({
  collected,
  total,
}: {
  collected: number;
  total: number;
}) {
  const BALL_COUNT = 10;
  const filledBalls =
    total === 0 ? 0 : Math.round((collected / total) * BALL_COUNT);

  return (
    <div className="flex justify-center gap-2 py-3" aria-hidden="true">
      {Array.from({ length: BALL_COUNT }, (_, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-2 transition-colors duration-300 ${
            i < filledBalls
              ? "bg-pokered border-pokered-light"
              : "bg-slate-200 border-slate-300"
          }`}
        />
      ))}
    </div>
  );
}
