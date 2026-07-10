import { Link } from "react-router-dom";

type RiskLevel = "High" | "Watch" | "Balanced" | "Low";

type TeamWeaknessRow = {
  type: string;
  weak: number;
  resist: number;
  immune: number;
  risk: RiskLevel;
};

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

const teamWeaknessOverview: TeamWeaknessRow[] = [
  { type: "Normal", weak: 0, resist: 1, immune: 1, risk: "Low" },
  { type: "Fire", weak: 3, resist: 2, immune: 0, risk: "High" },
  { type: "Water", weak: 1, resist: 3, immune: 0, risk: "Low" },
  { type: "Electric", weak: 0, resist: 2, immune: 1, risk: "Low" },
  { type: "Grass", weak: 2, resist: 4, immune: 0, risk: "Balanced" },
  { type: "Ice", weak: 3, resist: 3, immune: 0, risk: "High" },
  { type: "Fighting", weak: 1, resist: 2, immune: 1, risk: "Low" },
  { type: "Poison", weak: 0, resist: 1, immune: 2, risk: "Low" },
  { type: "Ground", weak: 2, resist: 0, immune: 2, risk: "Watch" },
  { type: "Flying", weak: 2, resist: 3, immune: 0, risk: "Balanced" },
  { type: "Psychic", weak: 2, resist: 1, immune: 1, risk: "Watch" },
  { type: "Bug", weak: 0, resist: 3, immune: 0, risk: "Low" },
  { type: "Rock", weak: 1, resist: 3, immune: 0, risk: "Low" },
  { type: "Ghost", weak: 1, resist: 1, immune: 0, risk: "Watch" },
  { type: "Dragon", weak: 1, resist: 2, immune: 0, risk: "Low" },
  { type: "Dark", weak: 1, resist: 2, immune: 0, risk: "Low" },
  { type: "Steel", weak: 0, resist: 3, immune: 0, risk: "Low" },
  { type: "Fairy", weak: 2, resist: 2, immune: 0, risk: "Watch" },
];

const getRiskLabel = (risk: RiskLevel) => (risk === "High" ? "High risk" : risk);

const getRiskClasses = (risk: RiskLevel) => {
  switch (risk) {
    case "High":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "Watch":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Balanced":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Matchup Summary
            </p>
            <h3
              id="team-weakness-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Team Weakness Overview
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-notebook-muted">
              Review how many team members are weak to, resist, or are immune to each attacking
              type.
            </p>
          </div>

          <span className="w-fit rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent">
            Static preview
          </span>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
              Highest Risk
            </p>
            <p className="mt-2 text-lg font-semibold text-notebook-text">Ice / Fire</p>
            <p className="mt-1 text-sm text-notebook-muted">3 weak members each</p>
          </article>

          <article className="rounded-2xl border border-notebook-border bg-notebook-background p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
              Key Immunities
            </p>
            <p className="mt-2 text-sm font-semibold text-notebook-text">Ground: 2</p>
            <p className="mt-1 text-sm font-semibold text-notebook-text">Poison: 2</p>
          </article>

          <article className="rounded-2xl border border-notebook-border bg-notebook-background p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
              Team Note
            </p>
            <p className="mt-2 text-sm leading-6 text-notebook-muted">
              Preserve Dragonite and Rotom-Wash for Ground immunity.
            </p>
          </article>
        </div>

        <div className="mt-6 grid gap-3 md:hidden">
          {teamWeaknessOverview.map((matchup) => (
            <article
              key={matchup.type}
              className={`rounded-2xl border p-4 ${
                matchup.risk === "High"
                  ? "border-rose-200 bg-rose-50/60"
                  : "border-notebook-border bg-notebook-background"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-semibold text-notebook-text">{matchup.type}</h4>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiskClasses(
                    matchup.risk,
                  )}`}
                >
                  {getRiskLabel(matchup.risk)}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-notebook-border bg-notebook-card px-2 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-notebook-muted">
                    Weak
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-notebook-text">{matchup.weak}</dd>
                </div>
                <div className="rounded-xl border border-notebook-border bg-notebook-card px-2 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-notebook-muted">
                    Resist
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-notebook-text">{matchup.resist}</dd>
                </div>
                <div
                  className={`rounded-xl border px-2 py-3 ${
                    matchup.immune > 0
                      ? "border-sky-200 bg-sky-50"
                      : "border-notebook-border bg-notebook-card"
                  }`}
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-notebook-muted">
                    Immune
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-notebook-text">{matchup.immune}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-notebook-border md:block">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-notebook-background text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-notebook-muted">
                  Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-notebook-muted">
                  Weak
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-notebook-muted">
                  Resist
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-notebook-muted">
                  Immune
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-notebook-muted">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody>
              {teamWeaknessOverview.map((matchup) => (
                <tr
                  key={matchup.type}
                  className={`border-t border-notebook-border ${
                    matchup.risk === "High" ? "bg-rose-50/60" : "bg-notebook-card"
                  }`}
                >
                  <th className="px-4 py-3 text-left font-semibold text-notebook-text">
                    {matchup.type}
                  </th>
                  <td className="px-4 py-3 text-center font-semibold text-notebook-text">
                    {matchup.weak}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-notebook-text">
                    {matchup.resist}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex min-w-8 items-center justify-center rounded-lg border px-2 py-1 font-semibold ${
                        matchup.immune > 0
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : "border-notebook-border bg-notebook-background text-notebook-muted"
                      }`}
                    >
                      {matchup.immune}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRiskClasses(
                        matchup.risk,
                      )}`}
                    >
                      {getRiskLabel(matchup.risk)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 rounded-xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm leading-6 text-notebook-muted">
          This overview uses static placeholder data. Automatic matchup calculation will be added
          in a later issue.
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
