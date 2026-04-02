import { getAllPokemonWithStatus, getCollectedCount } from "@/lib/db/queries";
import { isTrusted } from "@/lib/auth/session";
import { CollectionView } from "@/components/collection-view";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allPokemon, collectedCount, trusted] = await Promise.all([
    getAllPokemonWithStatus(),
    getCollectedCount(),
    isTrusted(),
  ]);

  if (allPokemon.length === 0) {
    return (
      <main className="max-w-7xl mx-auto">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto">
      <CollectionView
        initialPokemon={allPokemon}
        initialCollectedCount={collectedCount}
        initialTrusted={trusted}
      />
    </main>
  );
}
