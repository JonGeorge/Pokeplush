import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-pokered">
          Pokémon Collection
        </Link>
        <nav className="flex gap-3">
          <Link
            href="/whos-that"
            className="bg-pokeyellow hover:bg-pokegold text-slate-900 font-semibold px-4 py-2 rounded-lg min-h-[44px] flex items-center transition-colors"
          >
            Who&apos;s That?
          </Link>
        </nav>
      </div>
    </header>
  );
}
