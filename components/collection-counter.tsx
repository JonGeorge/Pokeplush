export function CollectionCounter({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl font-bold text-pokeblue">
          Your adventure begins!
        </p>
        <p className="text-lg text-slate-500 mt-1">
          Start collecting Pokémon plushies
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <p className="text-4xl font-bold text-pokeblue animate-bounce-in">
        🎉 {count} Collected!
      </p>
    </div>
  );
}
