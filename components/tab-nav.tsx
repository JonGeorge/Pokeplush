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
    <nav className="bg-white w-full pt-10">
      <div className="flex gap-14 items-start justify-center px-20">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.href) {
            return (
              <a
                key={tab.id}
                href={tab.href}
                className="font-body font-normal text-[18px] text-dark whitespace-nowrap pb-2"
              >
                {tab.label}
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`font-body text-[18px] whitespace-nowrap pb-2 transition-colors ${
                isActive
                  ? "font-semibold text-pokered"
                  : "font-normal text-dark hover:text-pokered/70"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {/* Underline indicators */}
      <div className="flex gap-14 items-start justify-center px-20 py-[10px]">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`h-px ${
              activeTab === tab.id ? "bg-pokered" : ""
            }`}
            style={{ width: tab.id === "whos-that" ? 177 : tab.id === "all" ? 102 : tab.id === "wishlist" ? 119 : 106 }}
          />
        ))}
      </div>
    </nav>
  );
}
