const navigationItems = [
  "Dashboard",
  "Pokédex",
  "Parties",
  "Battle Logs",
  "Research Notes",
  "Damage Notes",
  "Tags",
  "Settings",
];

function Sidebar() {
  return (
    <aside className="border-b border-notebook-border bg-notebook-card/80 px-5 py-4 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Workspace
          </p>
          <p className="mt-2 text-lg font-semibold">Battle Notebook</p>
        </div>

        <nav aria-label="Main navigation" className="overflow-x-auto lg:overflow-visible">
          <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col lg:gap-1">
            {navigationItems.map((item) => {
              const isActive = item === "Dashboard";

              return (
                <li key={item}>
                  <button
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-white/70 hover:text-notebook-text ${
                      isActive
                        ? "bg-white text-notebook-text shadow-sm ring-1 ring-notebook-border"
                        : "text-notebook-muted"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
