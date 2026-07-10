type PlaceholderResearchNote = {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  tags: string[];
  linkedPokemon: string[];
  linkedParties: string[];
  favorite: boolean;
};

const selectedResearchNote: PlaceholderResearchNote = {
  id: "research-note-001",
  title: "Dragonite setup opportunities",
  excerpt: "Situations where Dragonite can preserve Multiscale and safely use Dragon Dance.",
  updatedAt: "Updated Jul 9, 2026",
  tags: ["Dragonite", "Setup", "Single Battle"],
  linkedPokemon: ["Dragonite", "Rotom-Wash", "Gholdengo"],
  linkedParties: ["Dragonite Balance"],
  favorite: true,
};

const placeholderResearchNotes: PlaceholderResearchNote[] = [
  selectedResearchNote,
  {
    id: "research-note-002",
    title: "Breaking defensive cores",
    excerpt: "Ideas for using Trick, Knock Off, and repeated pivoting against defensive teams.",
    updatedAt: "Updated Jul 8, 2026",
    tags: ["Stall", "Matchup", "Practice"],
    linkedPokemon: ["Gholdengo", "Great Tusk", "Kingambit"],
    linkedParties: ["Dragonite Balance"],
    favorite: false,
  },
  {
    id: "research-note-003",
    title: "Rain matchup observations",
    excerpt: "Notes about weather control, preserving Rotom-Wash, and avoiding early momentum loss.",
    updatedAt: "Updated Jul 7, 2026",
    tags: ["Rain", "Matchup", "Ranked"],
    linkedPokemon: ["Rotom-Wash", "Amoonguss"],
    linkedParties: ["Dragonite Balance", "Rain Offense"],
    favorite: true,
  },
  {
    id: "research-note-004",
    title: "Trick Room counterplay",
    excerpt: "Pressure both setters and identify turns where delaying damage is more valuable.",
    updatedAt: "Updated Jul 5, 2026",
    tags: ["Trick Room", "Selection", "Practice"],
    linkedPokemon: ["Gholdengo", "Kingambit", "Amoonguss"],
    linkedParties: ["Dragonite Balance", "Trick Room Notes"],
    favorite: false,
  },
  {
    id: "research-note-005",
    title: "Tera type review",
    excerpt: "Review the defensive and offensive value of each current Tera Type assignment.",
    updatedAt: "Updated Jul 3, 2026",
    tags: ["Terastal", "Team Building", "Review"],
    linkedPokemon: ["Dragonite", "Kingambit", "Amoonguss"],
    linkedParties: ["Dragonite Balance"],
    favorite: false,
  },
];

const placeholderFilters = [
  "All notes",
  "Favorites",
  "Pokémon",
  "Parties",
  "Tags",
  "Recently updated",
];

function ResearchNotesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Knowledge Library
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Research Notes</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
              Organize metagame research, matchup observations, and team-building ideas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent">
              Static preview
            </span>
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted">
              {placeholderResearchNotes.length} placeholder notes
            </span>
          </div>
        </div>
      </section>

      <section
        aria-label="Research note search and filters"
        className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm"
      >
        <label
          htmlFor="research-note-search"
          className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent"
        >
          Search notes
        </label>
        <input
          id="research-note-search"
          type="search"
          placeholder="Search research notes..."
          className="mt-3 w-full rounded-xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm text-notebook-text outline-none placeholder:text-notebook-muted focus:border-notebook-accent"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {placeholderFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                index === 0
                  ? "border-notebook-accent bg-notebook-accent text-white"
                  : "border-notebook-border bg-notebook-background text-notebook-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-notebook-muted">
          Search and filter controls are visual placeholders.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Research Library
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">All Notes</h3>
          </div>

          <div className="space-y-3">
            {placeholderResearchNotes.map((note, index) => (
              <article
                key={note.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  index === 0
                    ? "border-notebook-accent bg-notebook-background ring-1 ring-notebook-accent/20"
                    : "border-notebook-border bg-notebook-card"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-notebook-muted">
                    {index === 0 ? "Selected" : "Research note"}
                  </span>
                  {note.favorite ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      ★ Favorite
                    </span>
                  ) : null}
                </div>

                <h4 className="mt-4 text-lg font-semibold tracking-tight text-notebook-text">
                  {note.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-notebook-muted">{note.excerpt}</p>
                <p className="mt-4 text-xs font-medium text-notebook-muted">{note.updatedAt}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-medium text-notebook-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-notebook-accent">
                      Pokémon
                    </dt>
                    <dd className="mt-1 font-semibold text-notebook-text">
                      {note.linkedPokemon.length}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-notebook-border bg-notebook-background px-3 py-3">
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-notebook-accent">
                      Parties
                    </dt>
                    <dd className="mt-1 font-semibold text-notebook-text">
                      {note.linkedParties.length}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <article className="rounded-3xl border border-notebook-border bg-notebook-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
                Research Note
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {selectedResearchNote.title}
              </h3>
              <p className="mt-3 text-sm text-notebook-muted">{selectedResearchNote.updatedAt}</p>
            </div>

            <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              ★ Favorite
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-notebook-border bg-notebook-background p-4 sm:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Tags
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedResearchNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-notebook-border bg-notebook-card px-3 py-1 text-xs font-medium text-notebook-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-notebook-border bg-notebook-background p-4 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Linked Pokémon
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedResearchNote.linkedPokemon.map((pokemon) => (
                  <span
                    key={pokemon}
                    className="rounded-full border border-notebook-accent/30 bg-notebook-card px-3 py-1 text-xs font-medium text-notebook-text"
                  >
                    {pokemon}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-notebook-border bg-notebook-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Linked Parties
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedResearchNote.linkedParties.map((party) => (
                  <span
                    key={party}
                    className="rounded-full border border-notebook-border bg-notebook-card px-3 py-1 text-xs font-medium text-notebook-text"
                  >
                    {party}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-7 text-notebook-muted sm:text-base">
            <section>
              <h4 className="text-lg font-semibold text-notebook-text">Overview</h4>
              <p className="mt-3">
                Dragonite is most effective when Multiscale is preserved until the setup turn.
                Avoid unnecessary chip damage before the opposing speed control has been
                identified.
              </p>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-notebook-text">Key observations</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Rotom-Wash can create setup opportunities through Volt Switch.</li>
                <li>Gholdengo pressures status-based counterplay.</li>
                <li>Extreme Speed should be preserved for late-game cleanup.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-notebook-text">Questions to test</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Is Tera Normal still the best default?</li>
                <li>Which lead patterns preserve Multiscale most consistently?</li>
                <li>When should Roost be prioritized over immediate setup?</li>
              </ul>
            </section>
          </div>
        </article>
      </section>

      <p className="rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm leading-6 text-notebook-muted">
        These research notes use static placeholder data. Creating, editing, searching, linking,
        and saving notes will be added in later issues.
      </p>
    </div>
  );
}

export default ResearchNotesPage;
