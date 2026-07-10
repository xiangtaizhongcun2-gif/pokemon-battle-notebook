import { Link } from "react-router-dom";

const placeholderParty = {
  name: "Dragonite Balance",
  game: "Scarlet / Violet",
  rule: "Single Battle",
  season: "Season Placeholder",
  concept: "Balanced team built around Dragonite with flexible defensive pivots.",
  favorite: true,
  updatedAt: "Updated recently",
  notes:
    "Preserve defensive options while creating a safe setup opportunity for Dragonite.",
  pokemon: [
    {
      name: "Dragonite",
      types: ["Dragon", "Flying"],
      item: "Heavy-Duty Boots",
      ability: "Multiscale",
      role: "Setup attacker",
      moves: ["Dragon Dance", "Extreme Speed", "Earthquake", "Roost"],
      mechanic: "Tera Normal",
    },
    {
      name: "Gholdengo",
      types: ["Steel", "Ghost"],
      item: "Choice Scarf",
      ability: "Good as Gold",
      role: "Speed control",
      moves: ["Make It Rain", "Shadow Ball", "Trick", "Recover"],
      mechanic: "Tera Steel",
    },
    {
      name: "Great Tusk",
      types: ["Ground", "Fighting"],
      item: "Booster Energy",
      ability: "Protosynthesis",
      role: "Physical utility",
      moves: ["Headlong Rush", "Close Combat", "Rapid Spin", "Knock Off"],
      mechanic: "Tera Ground",
    },
    {
      name: "Rotom-Wash",
      types: ["Electric", "Water"],
      item: "Leftovers",
      ability: "Levitate",
      role: "Defensive pivot",
      moves: ["Hydro Pump", "Volt Switch", "Will-O-Wisp", "Protect"],
      mechanic: "Tera Steel",
    },
    {
      name: "Kingambit",
      types: ["Dark", "Steel"],
      item: "Black Glasses",
      ability: "Supreme Overlord",
      role: "Late-game cleaner",
      moves: ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"],
      mechanic: "Tera Dark",
    },
    {
      name: "Amoonguss",
      types: ["Grass", "Poison"],
      item: "Rocky Helmet",
      ability: "Regenerator",
      role: "Defensive support",
      moves: ["Spore", "Giga Drain", "Sludge Bomb", "Clear Smog"],
      mechanic: "Tera Water",
    },
  ],
};

function PartyDetailPage() {
  return (
    <div className="space-y-8">
      <Link
        to="/parties"
        className="inline-flex items-center text-sm font-semibold text-notebook-accent transition hover:opacity-75"
      >
        ← Back to Parties
      </Link>

      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-6 py-8 shadow-xl shadow-slate-900/10 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Party
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              {placeholderParty.name}
            </h2>
            <p className="mt-5 text-base leading-7 text-notebook-muted sm:text-lg">
              {placeholderParty.concept}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-sm font-semibold text-notebook-accent">
              {placeholderParty.favorite ? "★ Favorite" : "☆ Favorite"}
            </span>
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-sm text-notebook-muted">
              {placeholderParty.updatedAt}
            </span>
          </div>
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-4">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
              Game
            </dt>
            <dd className="mt-2 text-sm font-medium text-notebook-text">
              {placeholderParty.game}
            </dd>
          </div>
          <div className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-4">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
              Rule
            </dt>
            <dd className="mt-2 text-sm font-medium text-notebook-text">
              {placeholderParty.rule}
            </dd>
          </div>
          <div className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-4">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
              Season
            </dt>
            <dd className="mt-2 text-sm font-medium text-notebook-text">
              {placeholderParty.season}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="party-pokemon-title" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Team composition
          </p>
          <h3 id="party-pokemon-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Six Pokémon Cards
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {placeholderParty.pokemon.map((pokemon) => (
            <article
              key={pokemon.name}
              className="flex h-full flex-col rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Pokémon
                  </p>
                  <h4 className="mt-2 text-xl font-semibold tracking-tight text-notebook-text">
                    {pokemon.name}
                  </h4>
                </div>
                <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent">
                  {pokemon.mechanic}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-notebook-accent">
                    Item
                  </dt>
                  <dd className="mt-1 text-notebook-muted">{pokemon.item}</dd>
                </div>
                <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-notebook-accent">
                    Ability
                  </dt>
                  <dd className="mt-1 text-notebook-muted">{pokemon.ability}</dd>
                </div>
                <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3 sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-notebook-accent">
                    Role
                  </dt>
                  <dd className="mt-1 text-notebook-muted">{pokemon.role}</dd>
                </div>
              </dl>

              <div className="mt-5 flex-1 rounded-2xl border border-notebook-border bg-notebook-background px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                  Moves
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {pokemon.moves.map((move) => (
                    <li
                      key={move}
                      className="rounded-lg border border-notebook-border bg-notebook-card px-3 py-2 text-sm text-notebook-muted"
                    >
                      {move}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="team-weakness-title"
        className="rounded-2xl border border-notebook-border bg-notebook-card p-6 shadow-sm"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Matchup summary
        </p>
        <h3 id="team-weakness-title" className="mt-2 text-2xl font-semibold tracking-tight">
          Team Weakness Overview
        </h3>
        <p className="mt-3 text-sm leading-6 text-notebook-muted">
          Detailed team matchup analysis will appear here.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-notebook-border bg-notebook-card p-6 shadow-sm lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Strategy
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Party Notes</h3>
          <p className="mt-3 text-sm leading-6 text-notebook-muted">{placeholderParty.notes}</p>
        </article>

        <article className="rounded-2xl border border-notebook-border bg-notebook-card p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Linked data
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Battle Logs</h3>
          <p className="mt-3 text-sm leading-6 text-notebook-muted">
            Related battle logs will appear here.
          </p>
          <p className="mt-5 rounded-xl border border-notebook-border bg-notebook-background px-3 py-2 text-sm font-medium text-notebook-text">
            3 placeholder logs
          </p>
        </article>

        <article className="rounded-2xl border border-notebook-border bg-notebook-card p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Linked data
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Research Notes</h3>
          <p className="mt-3 text-sm leading-6 text-notebook-muted">
            Related research notes will appear here.
          </p>
          <p className="mt-5 rounded-xl border border-notebook-border bg-notebook-background px-3 py-2 text-sm font-medium text-notebook-text">
            2 placeholder notes
          </p>
        </article>
      </section>
    </div>
  );
}

export default PartyDetailPage;
