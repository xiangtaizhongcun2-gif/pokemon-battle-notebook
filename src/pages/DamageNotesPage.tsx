type DamageNoteCategory = "Offensive" | "Defensive";

type PlaceholderDamageNote = {
  id: string;
  title: string;
  category: DamageNoteCategory;
  attacker: string;
  defender: string;
  move: string;
  result: string;
  conditions: string[];
  summary: string;
  updatedAt: string;
  tags: string[];
  linkedPokemon: string[];
  linkedParties: string[];
};

const selectedDamageNote: PlaceholderDamageNote = {
  id: "damage-note-001",
  title: "Dragonite Extreme Speed vs Flutter Mane",
  category: "Offensive",
  attacker: "Dragonite",
  defender: "Flutter Mane",
  move: "Extreme Speed",
  result: "88%–104% · Possible OHKO",
  conditions: ["Tera Normal", "Choice Band", "Defender at full HP"],
  summary:
    "Chip damage may be required before relying on Extreme Speed as the finishing move.",
  updatedAt: "Updated Jul 9, 2026",
  tags: ["Priority", "Endgame", "Damage Range"],
  linkedPokemon: ["Dragonite", "Flutter Mane"],
  linkedParties: ["Dragonite Balance"],
};

const placeholderDamageNotes: PlaceholderDamageNote[] = [
  selectedDamageNote,
  {
    id: "damage-note-002",
    title: "Great Tusk survives Dragonite Extreme Speed",
    category: "Defensive",
    attacker: "Dragonite",
    defender: "Great Tusk",
    move: "Extreme Speed",
    result: "Survives from full HP",
    conditions: ["No critical hit", "Great Tusk at full HP", "Defensive EV spread"],
    summary:
      "Great Tusk can remain available as an emergency answer when its HP is preserved.",
    updatedAt: "Updated Jul 8, 2026",
    tags: ["Survival", "Priority", "Defensive Check"],
    linkedPokemon: ["Dragonite", "Great Tusk"],
    linkedParties: ["Dragonite Balance"],
  },
  {
    id: "damage-note-003",
    title: "Gholdengo Make It Rain vs Dondozo",
    category: "Offensive",
    attacker: "Gholdengo",
    defender: "Dondozo",
    move: "Make It Rain",
    result: "42%–50% · Possible 2HKO after chip",
    conditions: ["Choice Specs", "No Special Attack drop", "Stealth Rock considered"],
    summary:
      "Avoid using Make It Rain too early if the Special Attack drop prevents the follow-up KO.",
    updatedAt: "Updated Jul 7, 2026",
    tags: ["Wallbreaking", "Stall", "Special Attack"],
    linkedPokemon: ["Gholdengo", "Dondozo"],
    linkedParties: ["Dragonite Balance"],
  },
  {
    id: "damage-note-004",
    title: "Rotom-Wash Hydro Pump vs Landorus",
    category: "Offensive",
    attacker: "Rotom-Wash",
    defender: "Landorus",
    move: "Hydro Pump",
    result: "Guaranteed OHKO after Stealth Rock",
    conditions: ["Stealth Rock active", "No defensive Tera", "Hydro Pump connects"],
    summary:
      "Keep hazards on the field when Rotom-Wash is the primary Landorus answer.",
    updatedAt: "Updated Jul 6, 2026",
    tags: ["Hazards", "Ground Matchup", "Offensive Check"],
    linkedPokemon: ["Rotom-Wash", "Landorus"],
    linkedParties: ["Dragonite Balance"],
  },
  {
    id: "damage-note-005",
    title: "Kingambit survives Dragapult Shadow Ball",
    category: "Defensive",
    attacker: "Dragapult",
    defender: "Kingambit",
    move: "Shadow Ball",
    result: "Comfortably survives",
    conditions: [
      "Kingambit at 80% HP or higher",
      "No Special Defense drop",
      "No offensive Tera boost",
    ],
    summary:
      "Preserving Kingambit helps maintain a late-game response to fast Ghost-type attackers.",
    updatedAt: "Updated Jul 5, 2026",
    tags: ["Survival", "Ghost Matchup", "Endgame"],
    linkedPokemon: ["Kingambit", "Dragapult"],
    linkedParties: ["Dragonite Balance"],
  },
  {
    id: "damage-note-006",
    title: "Amoonguss survives Primarina Moonblast",
    category: "Defensive",
    attacker: "Primarina",
    defender: "Amoonguss",
    move: "Moonblast",
    result: "Survives one hit from full HP",
    conditions: ["Amoonguss at full HP", "Assault Vest", "No critical hit"],
    summary:
      "Amoonguss can absorb one attack and create a pivot opportunity when its HP is managed.",
    updatedAt: "Updated Jul 3, 2026",
    tags: ["Survival", "Pivot", "Special Defense"],
    linkedPokemon: ["Amoonguss", "Primarina"],
    linkedParties: ["Dragonite Balance"],
  },
];

const placeholderFilters = [
  "All notes",
  "Offensive",
  "Defensive",
  "Pokémon",
  "Parties",
  "Tags",
  "Recently updated",
];

const offensiveNoteCount = placeholderDamageNotes.filter(
  (note) => note.category === "Offensive",
).length;

const defensiveNoteCount = placeholderDamageNotes.filter(
  (note) => note.category === "Defensive",
).length;

const getCategoryClasses = (category: DamageNoteCategory) => {
  switch (category) {
    case "Offensive":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "Defensive":
      return "border-sky-200 bg-sky-50 text-sky-700";
  }
};

function DamageNotesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Calculation Library
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Damage Notes</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
              Keep important KO ranges, survival checks, and battle conditions in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent">
              Static preview
            </span>
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted">
              {placeholderDamageNotes.length} placeholder notes
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Damage note summary" className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
            Offensive Checks
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{offensiveNoteCount} notes</p>
        </article>
        <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
            Defensive Checks
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{defensiveNoteCount} notes</p>
        </article>
        <article className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
            Selected Note
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight">Dragonite vs Flutter Mane</p>
        </article>
      </section>

      <section
        aria-label="Damage note search and filters"
        className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm"
      >
        <label
          htmlFor="damage-note-search"
          className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent"
        >
          Search notes
        </label>
        <input
          id="damage-note-search"
          type="search"
          placeholder="Search damage notes..."
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
              Damage Library
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">All Notes</h3>
          </div>

          <div className="space-y-3">
            {placeholderDamageNotes.map((note, index) => (
              <article
                key={note.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  index === 0
                    ? "border-notebook-accent bg-notebook-background ring-1 ring-notebook-accent/20"
                    : "border-notebook-border bg-notebook-card"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getCategoryClasses(
                      note.category,
                    )}`}
                  >
                    {note.category}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-notebook-muted">
                    {index === 0 ? "Selected" : "Damage note"}
                  </span>
                </div>

                <h4 className="mt-4 text-lg font-semibold tracking-tight text-notebook-text">
                  {note.title}
                </h4>

                <div className="mt-4 rounded-xl border border-notebook-border bg-notebook-background px-4 py-3">
                  <p className="text-sm font-semibold text-notebook-text">
                    {note.attacker} <span className="text-notebook-muted">→</span> {note.defender}
                  </p>
                  <p className="mt-1 text-sm text-notebook-muted">Move: {note.move}</p>
                </div>

                <p className="mt-4 text-sm font-semibold leading-6 text-notebook-text">{note.result}</p>
                <p className="mt-3 text-xs font-medium text-notebook-muted">{note.updatedAt}</p>

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
                Damage Note
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {selectedDamageNote.title}
              </h3>
              <p className="mt-3 text-sm text-notebook-muted">{selectedDamageNote.updatedAt}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getCategoryClasses(
                  selectedDamageNote.category,
                )}`}
              >
                {selectedDamageNote.category}
              </span>
              <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted">
                Static example
              </span>
            </div>
          </div>

          <section aria-label="Selected damage matchup" className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Attacker
              </p>
              <p className="mt-3 text-lg font-semibold">{selectedDamageNote.attacker}</p>
            </div>
            <div className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Move
              </p>
              <p className="mt-3 text-lg font-semibold">{selectedDamageNote.move}</p>
            </div>
            <div className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Defender
              </p>
              <p className="mt-3 text-lg font-semibold">{selectedDamageNote.defender}</p>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-notebook-accent/30 bg-notebook-background p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
              Result
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-notebook-text">
              {selectedDamageNote.result}
            </p>
            <p className="mt-3 text-sm leading-6 text-notebook-muted">
              Illustrative placeholder value — no calculation has been performed.
            </p>
          </section>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
              <h4 className="text-lg font-semibold tracking-tight">Conditions</h4>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-notebook-muted">
                {selectedDamageNote.conditions.map((condition) => (
                  <li key={condition} className="flex gap-3">
                    <span aria-hidden="true" className="text-notebook-accent">
                      •
                    </span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
              <h4 className="text-lg font-semibold tracking-tight">Battle note</h4>
              <p className="mt-4 text-sm leading-7 text-notebook-muted">
                {selectedDamageNote.summary} Preserve Dragonite&apos;s HP until opposing speed
                control has been identified.
              </p>
            </section>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <section className="rounded-2xl border border-notebook-border bg-notebook-background p-4 sm:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Tags
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDamageNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-notebook-border bg-notebook-card px-3 py-1 text-xs font-medium text-notebook-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-notebook-border bg-notebook-background p-4 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Linked Pokémon
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDamageNote.linkedPokemon.map((pokemon) => (
                  <span
                    key={pokemon}
                    className="rounded-full border border-notebook-accent/30 bg-notebook-card px-3 py-1 text-xs font-medium text-notebook-text"
                  >
                    {pokemon}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-notebook-border bg-notebook-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Linked Parties
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDamageNote.linkedParties.map((party) => (
                  <span
                    key={party}
                    className="rounded-full border border-notebook-border bg-notebook-card px-3 py-1 text-xs font-medium text-notebook-text"
                  >
                    {party}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </article>
      </section>

      <p className="rounded-2xl border border-notebook-border bg-notebook-background px-5 py-4 text-sm leading-6 text-notebook-muted">
        These damage notes use static placeholder data. No damage calculations have been
        performed. Creating, editing, calculating, filtering, and saving notes will be added in
        later issues.
      </p>
    </div>
  );
}

export default DamageNotesPage;
