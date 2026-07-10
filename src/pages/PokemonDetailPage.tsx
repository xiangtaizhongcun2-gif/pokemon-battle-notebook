const pokemonDetail = {
  name: "Dragonite",
  types: ["Dragon", "Flying"],
  role: "Bulky setup attacker placeholder.",
  weaknesses: ["Ice", "Rock", "Dragon", "Fairy"],
  resistances: ["Fire", "Water", "Grass", "Fighting", "Bug"],
  immunities: ["Ground"],
  battleNotes: "Write matchup notes, common moves, and important battle observations here.",
  buildNotes: "Write item, ability, nature, EV spread, and move ideas here.",
  relatedNotes: "Related parties, battle logs, and research notes will appear here.",
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

      <section aria-labelledby="matchup-overview-title" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Matchup overview
          </p>
          <h3 id="matchup-overview-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Type matchup placeholders
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-notebook-accent">
              Weakness
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pokemonDetail.weaknesses.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                >
                  {type}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-notebook-accent">
              Resistance
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pokemonDetail.resistances.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                >
                  {type}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-notebook-accent">
              Immunity
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pokemonDetail.immunities.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted"
                >
                  {type}
                </span>
              ))}
            </div>
          </article>
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
  );
}

export default PokemonDetailPage;
