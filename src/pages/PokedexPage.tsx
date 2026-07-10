import { Link } from "react-router-dom";

const placeholderPokemon = [
  {
    name: "Dragonite",
    types: ["Dragon", "Flying"],
    note: "Bulky setup attacker placeholder.",
    weakness: "Ice, Rock, Dragon, Fairy",
    href: "/pokedex/dragonite",
  },
  {
    name: "Garchomp",
    types: ["Dragon", "Ground"],
    note: "Fast physical attacker placeholder.",
    weakness: "Ice, Dragon, Fairy",
    href: null,
  },
  {
    name: "Rotom-Wash",
    types: ["Electric", "Water"],
    note: "Defensive pivot and utility placeholder.",
    weakness: "Grass",
    href: null,
  },
  {
    name: "Flutter Mane",
    types: ["Ghost", "Fairy"],
    note: "Fast special attacker placeholder.",
    weakness: "Ghost, Steel",
    href: null,
  },
  {
    name: "Kingambit",
    types: ["Dark", "Steel"],
    note: "Late-game cleaner placeholder.",
    weakness: "Fighting, Ground, Fire",
    href: null,
  },
];

const filterChips = ["All", "Type", "Weakness", "Favorites"];

function PokedexPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Pokédex
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Pokédex</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
          Pokémon profiles, typing, weaknesses, and battle notes will appear here.
        </p>
      </section>

      <section aria-label="Pokédex search and filters" className="space-y-4">
        <label className="sr-only" htmlFor="pokedex-search">
          Search Pokémon
        </label>
        <input
          id="pokedex-search"
          type="search"
          placeholder="Search Pokémon placeholder"
          className="min-h-12 w-full rounded-2xl border border-notebook-border bg-notebook-card px-4 text-sm text-notebook-text outline-none transition placeholder:text-notebook-muted focus:border-notebook-accent focus:ring-2 focus:ring-notebook-accent/20"
        />

        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="rounded-full border border-notebook-border bg-notebook-card px-4 py-2 text-sm font-medium text-notebook-muted transition hover:bg-white hover:text-notebook-text"
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="pokedex-list-title" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Pokémon list
          </p>
          <h3 id="pokedex-list-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Placeholder Pokémon
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {placeholderPokemon.map((pokemon) => {
            const cardContent = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-notebook-text">{pokemon.name}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="rounded-full bg-notebook-background px-3 py-1 text-xs font-medium text-notebook-muted">
                    Note
                  </span>
                </div>

                <p className="mt-5 text-sm leading-6 text-notebook-muted">{pokemon.note}</p>

                <div className="mt-5 rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                    Weakness placeholder
                  </p>
                  <p className="mt-2 text-sm leading-6 text-notebook-muted">{pokemon.weakness}</p>
                </div>
              </>
            );

            return (
              <article key={pokemon.name}>
                {pokemon.href === null ? (
                  <div className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    {cardContent}
                  </div>
                ) : (
                  <Link
                    to={pokemon.href}
                    className="block rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-notebook-accent/20"
                  >
                    {cardContent}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default PokedexPage;
