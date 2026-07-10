type BattleResult = "Win" | "Loss" | "Draw";

type PlaceholderBattleLog = {
  id: string;
  date: string;
  result: BattleResult;
  opponent: string;
  usedParty: string;
  opponentTeam: string[];
  selectedPokemon: string[];
  mvp: string;
  tags: string[];
  memo: string;
};

const placeholderBattleLogs: PlaceholderBattleLog[] = [
  {
    id: "battle-log-001",
    date: "2026-07-08",
    result: "Win",
    opponent: "Trainer A",
    usedParty: "Dragonite Balance",
    opponentTeam: [
      "Garchomp",
      "Rotom-Wash",
      "Gholdengo",
      "Amoonguss",
      "Kingambit",
      "Dragonite",
    ],
    selectedPokemon: ["Dragonite", "Gholdengo", "Great Tusk"],
    mvp: "Dragonite",
    tags: ["Ranked", "Balance"],
    memo: "Preserved Multiscale and created a safe Dragon Dance opportunity.",
  },
  {
    id: "battle-log-002",
    date: "2026-07-07",
    result: "Loss",
    opponent: "Rain Player",
    usedParty: "Dragonite Balance",
    opponentTeam: [
      "Pelipper",
      "Barraskewda",
      "Archaludon",
      "Rillaboom",
      "Flutter Mane",
      "Landorus",
    ],
    selectedPokemon: ["Rotom-Wash", "Amoonguss", "Kingambit"],
    mvp: "Rotom-Wash",
    tags: ["Ranked", "Rain"],
    memo: "Lost momentum after allowing Pelipper to reset the weather.",
  },
  {
    id: "battle-log-003",
    date: "2026-07-05",
    result: "Win",
    opponent: "Trick Room Practice",
    usedParty: "Dragonite Balance",
    opponentTeam: [
      "Indeedee",
      "Hatterene",
      "Ursaluna",
      "Torkoal",
      "Amoonguss",
      "Iron Hands",
    ],
    selectedPokemon: ["Gholdengo", "Kingambit", "Amoonguss"],
    mvp: "Gholdengo",
    tags: ["Practice", "Trick Room"],
    memo: "Delayed the setup turn and pressured both Trick Room setters.",
  },
  {
    id: "battle-log-004",
    date: "2026-07-03",
    result: "Draw",
    opponent: "Practice Partner",
    usedParty: "Dragonite Balance",
    opponentTeam: [
      "Volcarona",
      "Ting-Lu",
      "Primarina",
      "Corviknight",
      "Dragapult",
      "Clodsire",
    ],
    selectedPokemon: ["Great Tusk", "Dragonite", "Kingambit"],
    mvp: "Great Tusk",
    tags: ["Practice", "Long Game"],
    memo: "The battle ended before the final position could be resolved.",
  },
  {
    id: "battle-log-005",
    date: "2026-07-01",
    result: "Loss",
    opponent: "Stall Specialist",
    usedParty: "Dragonite Balance",
    opponentTeam: [
      "Dondozo",
      "Clodsire",
      "Corviknight",
      "Blissey",
      "Skeledirge",
      "Gliscor",
    ],
    selectedPokemon: ["Dragonite", "Gholdengo", "Great Tusk"],
    mvp: "Gholdengo",
    tags: ["Ranked", "Stall"],
    memo: "Used Trick too early and could not break the defensive core.",
  },
];

const placeholderFilters = ["All results", "Game", "Rule", "Season", "Party", "Tags", "Pokémon"];

const getResultClasses = (result: BattleResult) => {
  switch (result) {
    case "Win":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Loss":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "Draw":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

function BattleLogsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Battle Records
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Battle Logs</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
              Review results, team selections, and lessons from recent battles.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent">
              Static preview
            </span>
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted">
              {placeholderBattleLogs.length} placeholder logs
            </span>
          </div>
        </div>
      </section>

      <section
        aria-label="Battle log filters"
        className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm"
      >
        <div className="flex flex-wrap gap-2">
          {placeholderFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                index === 0
                  ? "border-notebook-accent bg-notebook-accent text-white"
                  : "border-notebook-border bg-notebook-background text-notebook-muted hover:border-notebook-accent hover:text-notebook-accent"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-notebook-muted">Filter controls are visual placeholders.</p>
      </section>

      <section aria-labelledby="battle-log-list-title" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Recent matches
          </p>
          <h3 id="battle-log-list-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Battle Log List
          </h3>
        </div>

        <div className="space-y-4 md:hidden">
          {placeholderBattleLogs.map((log) => (
            <article
              key={log.id}
              className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <time className="text-sm font-medium text-notebook-muted">{log.date}</time>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getResultClasses(
                    log.result,
                  )}`}
                >
                  {log.result}
                </span>
              </div>

              <h4 className="mt-4 text-xl font-semibold tracking-tight text-notebook-text">
                vs {log.opponent}
              </h4>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Used Party
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-notebook-text">{log.usedParty}</dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Selected Pokémon
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {log.selectedPokemon.map((pokemon) => (
                      <span
                        key={pokemon}
                        className="rounded-full border border-notebook-accent/30 bg-notebook-background px-3 py-1 text-xs font-medium text-notebook-text"
                      >
                        {pokemon}
                      </span>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Opponent Team
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {log.opponentTeam.map((pokemon) => (
                      <span
                        key={pokemon}
                        className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-medium text-notebook-muted"
                      >
                        {pokemon}
                      </span>
                    ))}
                  </dd>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                      MVP
                    </dt>
                    <dd className="mt-2">
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {log.mvp}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                      Tags
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {log.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-medium text-notebook-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                    Memo
                  </dt>
                  <dd className="mt-2 rounded-xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm leading-6 text-notebook-muted">
                    {log.memo}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-notebook-border bg-notebook-card shadow-sm md:block">
          <table className="min-w-[1480px] border-collapse text-sm">
            <thead className="bg-notebook-background text-left">
              <tr>
                {[
                  "Date",
                  "Result",
                  "Opponent",
                  "Used Party",
                  "Opponent Team",
                  "Selected Pokémon",
                  "MVP",
                  "Tags",
                  "Memo",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-notebook-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placeholderBattleLogs.map((log) => (
                <tr key={log.id} className="border-t border-notebook-border align-top">
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-notebook-muted">
                    {log.date}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getResultClasses(
                        log.result,
                      )}`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-notebook-text">{log.opponent}</td>
                  <td className="px-4 py-4 text-notebook-muted">{log.usedParty}</td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-sm flex-wrap gap-2">
                      {log.opponentTeam.map((pokemon) => (
                        <span
                          key={pokemon}
                          className="rounded-full border border-notebook-border bg-notebook-background px-2.5 py-1 text-xs text-notebook-muted"
                        >
                          {pokemon}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-xs flex-wrap gap-2">
                      {log.selectedPokemon.map((pokemon) => (
                        <span
                          key={pokemon}
                          className="rounded-full border border-notebook-accent/30 bg-notebook-background px-2.5 py-1 text-xs font-medium text-notebook-text"
                        >
                          {pokemon}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {log.mvp}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-xs flex-wrap gap-2">
                      {log.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-notebook-border bg-notebook-background px-2.5 py-1 text-xs text-notebook-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="max-w-sm px-4 py-4 leading-6 text-notebook-muted">{log.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-2xl border border-notebook-border bg-notebook-card px-5 py-4 text-sm leading-6 text-notebook-muted shadow-sm">
        These battle logs use static placeholder data. Creating, editing, filtering, and saving logs
        will be added in later issues.
      </p>
    </div>
  );
}

export default BattleLogsPage;
