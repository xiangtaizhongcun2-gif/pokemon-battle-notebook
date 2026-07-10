const pokemonDetail = {
  name: "Dragonite",
  types: ["Dragon", "Flying"],
  role: "Bulky setup attacker placeholder.",
  weaknesses: ["Ice", "Rock", "Dragon", "Fairy"],
  resistances: ["Fire", "Water", "Grass", "Fighting", "Bug"],
  immunities: ["Ground"],
  keyMemo: "Check Ice-type coverage and preserve Multiscale when possible.",
  buildSummary: "Setup attacker with flexible item and move options.",
  battleNotes: "Write matchup notes, common moves, and important battle observations here.",
  buildNotes: "Write item, ability, nature, EV spread, and move ideas here.",
  relatedNotes: "Related parties, battle logs, and research notes will appear here.",
};

const typeMatchups = {
  weaknesses: [
    { type: "Ice", multiplier: "×4" },
    { type: "Rock", multiplier: "×2" },
    { type: "Dragon", multiplier: "×2" },
    { type: "Fairy", multiplier: "×2" },
  ],
  resistances: [
    { type: "Fire", multiplier: "×0.5" },
    { type: "Water", multiplier: "×0.5" },
    { type: "Fighting", multiplier: "×0.5" },
    { type: "Bug", multiplier: "×0.5" },
    { type: "Grass", multiplier: "×0.25" },
  ],
  immunities: [{ type: "Ground", multiplier: "×0" }],
  note: "Ice-type attacks are especially dangerous. Preserve Multiscale when possible.",
};

function PokemonDetailPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Pokémon detail
        </p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">{pokemonDetail.name}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
              {pokemonDetail.role}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {pokemonDetail.types.map((type) => (
              <span
                key={type}
                className="rounded-full border border-notebook-border bg-notebook-background px-4 py-2 text-sm font-semibold text-notebook-accent"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-8">
          <section aria-labelledby="type-matchup-title" className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
                Type Matchup
              </p>
              <h3 id="type-matchup-title" className="mt-2 text-2xl font-semibold tracking-tight">
                Damage multiplier placeholders
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-notebook-accent">
                  Weakness
                </p>
                <div className="mt-4 space-y-2">
                  {typeMatchups.weaknesses.map((matchup) => (
                    <div
                      key={matchup.type}
                      className="flex items-center justify-between gap-4 rounded-xl border border-notebook-border bg-notebook-background px-3 py-2"
                    >
                      <span className="text-sm font-medium text-notebook-text">{matchup.type}</span>
                      <span className="text-sm font-semibold text-notebook-accent">
                        {matchup.multiplier}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-notebook-accent">
                  Resistance
                </p>
                <div className="mt-4 space-y-2">
                  {typeMatchups.resistances.map((matchup) => (
                    <div
                      key={matchup.type}
                      className="flex items-center justify-between gap-4 rounded-xl border border-notebook-border bg-notebook-background px-3 py-2"
                    >
                      <span className="text-sm font-medium text-notebook-text">{matchup.type}</span>
                      <span className="text-sm font-semibold text-notebook-accent">
                        {matchup.multiplier}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-notebook-accent">
                  Immunity
                </p>
                <div className="mt-4 space-y-2">
                  {typeMatchups.immunities.map((matchup) => (
                    <div
                      key={matchup.type}
                      className="flex items-center justify-between gap-4 rounded-xl border border-notebook-border bg-notebook-background px-3 py-2"
                    >
                      <span className="text-sm font-medium text-notebook-text">{matchup.type}</span>
                      <span className="text-sm font-semibold text-notebook-accent">
                        {matchup.multiplier}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="rounded-2xl border border-notebook-border bg-notebook-background px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Type matchup note
              </p>
              <p className="mt-2 text-sm leading-6 text-notebook-muted">{typeMatchups.note}</p>
            </div>
          </section>

          <section aria-labelledby="detail-notes-title" className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
                Notes
              </p>
              <h3 id="detail-notes-title" className="mt-2 text-2xl font-semibold tracking-tight">
                Battle knowledge placeholders
              </h3>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
                <p className="text-base font-semibold text-notebook-text">Battle notes</p>
                <p className="mt-3 text-sm leading-6 text-notebook-muted">{pokemonDetail.battleNotes}</p>
              </article>

              <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
                <p className="text-base font-semibold text-notebook-text">Build notes</p>
                <p className="mt-3 text-sm leading-6 text-notebook-muted">{pokemonDetail.buildNotes}</p>
              </article>

              <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
                <p className="text-base font-semibold text-notebook-text">Related notes</p>
                <p className="mt-3 text-sm leading-6 text-notebook-muted">{pokemonDetail.relatedNotes}</p>
              </article>
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="quick-view-title"
          className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Quick View
          </p>
          <h3 id="quick-view-title" className="mt-2 text-xl font-semibold tracking-tight">
            At-a-glance notes
          </h3>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Type
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pokemonDetail.types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Weakness
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pokemonDetail.weaknesses.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Resistance
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pokemonDetail.resistances.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Immunity
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pokemonDetail.immunities.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Key battle memo
              </p>
              <p className="mt-2 text-sm leading-6 text-notebook-muted">{pokemonDetail.keyMemo}</p>
            </div>

            <div className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-notebook-accent">
                Build summary
              </p>
              <p className="mt-2 text-sm leading-6 text-notebook-muted">{pokemonDetail.buildSummary}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PokemonDetailPage;
