"use client";

type Tab = {
  id: string;
  label: string;
  href?: string;
};

const TABS: Tab[] = [
  { id: "whos-that", label: "Who's That Pokémon?", href: "/whos-that" },
  { id: "all", label: "All Pokémon" },
  { id: "wishlist", label: "Stuffy Wishlist" },
  { id: "collection", label: "My Collection" },
];

export function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <nav className="bg-white w-full pt-6 md:pt-10 pb-2">
      <div className="flex gap-6 sm:gap-8 lg:gap-14 items-start justify-start lg:justify-center px-4 sm:px-8 lg:px-20 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.href) {
            return (
              <a
                key={tab.id}
                href={tab.href}
                className="font-body font-normal text-[15px] sm:text-[16px] md:text-[18px] text-dark whitespace-nowrap pb-2 border-b-2 border-transparent"
              >
                {tab.label}
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`font-body text-[15px] sm:text-[16px] md:text-[18px] whitespace-nowrap pb-2 border-b-2 transition-colors ${
                isActive
                  ? "font-semibold text-pokered border-pokered"
                  : "font-normal text-dark hover:text-pokered/70 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
