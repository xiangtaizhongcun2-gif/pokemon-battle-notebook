function Header() {
  return (
    <header className="border-b border-notebook-border bg-notebook-card/70 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-notebook-muted">Dashboard</p>
          <h1 className="text-xl font-semibold tracking-tight">Pokémon Battle Notebook</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="global-search">
            Search
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="Search placeholder"
            className="min-h-10 w-full rounded-xl border border-notebook-border bg-white/80 px-3 text-sm text-notebook-text outline-none transition placeholder:text-notebook-muted focus:border-notebook-accent focus:ring-2 focus:ring-notebook-accent/20 sm:w-72"
          />

          <button
            type="button"
            className="min-h-10 rounded-xl border border-notebook-border bg-white px-4 text-sm font-semibold text-notebook-text shadow-sm transition hover:bg-white/80"
          >
            New
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
