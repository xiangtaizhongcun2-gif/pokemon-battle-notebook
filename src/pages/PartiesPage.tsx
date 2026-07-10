const placeholderParties = [
  {
    name: "Dragonite Balance",
    pokemon: [
      "Dragonite",
      "Gholdengo",
      "Great Tusk",
      "Rotom-Wash",
      "Kingambit",
      "Amoonguss",
    ],
    game: "Scarlet / Violet",
    rule: "Single Battle",
    season: "Season Placeholder",
    concept: "Balanced team built around Dragonite with flexible defensive pivots.",
    winRate: "62%",
    updatedAt: "Updated recently",
    favorite: true,
  },
  {
    name: "Rain Offense",
    pokemon: [
      "Pelipper",
      "Barraskewda",
      "Archaludon",
      "Rillaboom",
      "Landorus",
      "Flutter Mane",
    ],
    game: "Scarlet / Violet",
    rule: "Double Battle",
    season: "Regulation Placeholder",
    concept: "Fast rain offense with flexible speed control and support.",
    winRate: "58%",
    updatedAt: "Updated 3 days ago",
    favorite: false,
  },
  {
    name: "Trick Room Notes",
    pokemon: [
      "Indeedee",
      "Hatterene",
      "Ursaluna",
      "Torkoal",
      "Amoonguss",
      "Iron Hands",
    ],
    game: "Scarlet / Violet",
    rule: "Double Battle",
    season: "Practice",
    concept: "Slow attackers supported by Trick Room and durable redirection.",
    winRate: "Placeholder",
    updatedAt: "Updated last week",
    favorite: false,
  },
];

const placeholderFilters = ["All", "Game", "Rule", "Season", "Favorites", "Recently updated"];

function PartiesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Party Library
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Parties</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
              Review team compositions, concepts, and battle notes.
            </p>
          </div>

          <div className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm text-notebook-muted">
            3 placeholder parties
          </div>
        </div>
      </section>

      <section aria-label="Party list controls" className="space-y-4">
        <label className="block">
          <span className="sr-only">Search parties</span>
          <input
            type="search"
            placeholder="Search parties"
            className="w-full rounded-2xl border border-notebook-border bg-notebook-card px-4 py-3 text-sm text-notebook-text shadow-sm outline-none transition placeholder:text-notebook-muted focus:border-notebook-accent focus:ring-2 focus:ring-notebook-accent/20"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {placeholderFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                index === 0
                  ? "border-notebook-accent bg-notebook-accent text-white"
                  : "border-notebook-border bg-notebook-card text-notebook-muted hover:border-notebook-accent hover:text-notebook-accent"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="party-grid-title" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Team compositions
          </p>
          <h3 id="party-grid-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Placeholder parties
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {placeholderParties.map((party) => (
            <article
              key={party.name}
              className="flex h-full flex-col rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                    Party
                  </p>
                  <h4 className="mt-2 text-xl font-semibold tracking-tight text-notebook-text">
                    {party.name}
                  </h4>
                </div>

                <span
                  aria-label={party.favorite ? "Favorite party" : "Not a favorite party"}
                  className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-sm text-notebook-accent"
                >
                  {party.favorite ? "★ Favorite" : "☆ Favorite"}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                  6 Pokémon
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {party.pokemon.map((pokemon) => (
                    <span
                      key={pokemon}
                      className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-2 text-sm font-medium text-notebook-text"
                    >
                      {pokemon}
                    </span>
                  ))}
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Game
                  </dt>
                  <dd className="mt-1 text-notebook-muted">{party.game}</dd>
                </div>
                <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Rule
                  </dt>
                  <dd className="mt-1 text-notebook-muted">{party.rule}</dd>
                </div>
                <div className="col-span-2 rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Season
                  </dt>
                  <dd className="mt-1 text-notebook-muted">{party.season}</dd>
                </div>
              </dl>

              <div className="mt-5 flex-1 rounded-2xl border border-notebook-border bg-notebook-background px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                  Concept
                </p>
                <p className="mt-2 text-sm leading-6 text-notebook-muted">{party.concept}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-notebook-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Win rate
                  </p>
                  <p className="mt-1 font-semibold text-notebook-text">{party.winRate}</p>
                </div>
                <p className="text-notebook-muted">{party.updatedAt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PartiesPage;
