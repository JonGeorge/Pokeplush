export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <p className="text-6xl mb-4">🔴</p>
      <h2 className="text-2xl font-bold text-slate-700 mb-2">
        No Pokémon data yet!
      </h2>
      <p className="text-slate-500 max-w-md">
        Run the seed script to populate Pokémon data:
      </p>
      <code className="mt-3 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm">
        npx tsx scripts/seed-pokemon.ts
      </code>
    </div>
  );
}
