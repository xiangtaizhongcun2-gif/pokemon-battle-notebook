const settingsMenuItems = [
  {
    title: "Appearance",
    description: "Theme and visual preferences",
    current: true,
  },
  {
    title: "Battle Defaults",
    description: "Default game and rule",
    current: false,
  },
  {
    title: "Data Management",
    description: "Export and import controls",
    current: false,
  },
  {
    title: "Danger Zone",
    description: "Reset application data",
    current: false,
  },
  {
    title: "App Information",
    description: "Version and storage status",
    current: false,
  },
];

const themeOptions = [
  {
    name: "Light",
    description: "Use a light background and dark text.",
    status: "Selected",
    selected: true,
  },
  {
    name: "Dark",
    description: "Use a dark background and light text.",
    status: "Coming later",
    selected: false,
  },
  {
    name: "System",
    description: "Follow the device appearance setting.",
    status: "Coming later",
    selected: false,
  },
];

const appInformation = [
  { label: "Application", value: "Pokémon Battle Notebook" },
  { label: "Build", value: "UI Prototype" },
  { label: "Current Phase", value: "Phase 3 - Core UI Mock Screens" },
  { label: "Storage", value: "Static placeholder data" },
  { label: "Data Models", value: "Not implemented yet" },
];

function SettingsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Workspace Configuration
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Settings</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-notebook-muted sm:text-lg">
              Review appearance, battle defaults, data controls, and application information.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-accent">
              Static preview
            </span>
            <span className="rounded-full border border-notebook-border bg-notebook-background px-3 py-1 text-xs font-semibold text-notebook-muted">
              Phase 3 final screen
            </span>
          </div>
        </div>
      </section>

      <p className="rounded-2xl border border-notebook-border bg-notebook-card px-5 py-4 text-sm leading-6 text-notebook-muted shadow-sm">
        Settings shown on this page are visual placeholders and are not saved.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,2fr)]">
        <aside className="h-fit rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Settings Menu
          </p>
          <div className="mt-4 space-y-2">
            {settingsMenuItems.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border px-4 py-3 ${
                  item.current
                    ? "border-notebook-accent bg-notebook-background ring-1 ring-notebook-accent/20"
                    : "border-notebook-border bg-notebook-card"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-notebook-text">{item.title}</p>
                  {item.current ? (
                    <span className="rounded-full border border-notebook-accent/30 bg-notebook-card px-2 py-0.5 text-xs font-semibold text-notebook-accent">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-5 text-notebook-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-3xl border border-notebook-border bg-notebook-card p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Appearance
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Theme</h3>
            <p className="mt-2 text-sm leading-6 text-notebook-muted">
              Choose how Pokémon Battle Notebook should look.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {themeOptions.map((theme) => (
                <article
                  key={theme.name}
                  className={`rounded-2xl border p-5 ${
                    theme.selected
                      ? "border-notebook-accent bg-notebook-background ring-1 ring-notebook-accent/20"
                      : "border-notebook-border bg-notebook-background"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-notebook-text">{theme.name}</h4>
                    <span className="rounded-full border border-notebook-border bg-notebook-card px-2 py-0.5 text-xs font-semibold text-notebook-muted">
                      {theme.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-notebook-muted">
                    {theme.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-notebook-border bg-notebook-card p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Battle Defaults
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Future record defaults</h3>
            <p className="mt-2 text-sm leading-6 text-notebook-muted">
              Choose the game and rule shown by default when creating future records.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                  Default Game
                </p>
                <p className="mt-3 text-lg font-semibold text-notebook-text">
                  Pokémon Scarlet / Violet
                </p>
                <p className="mt-2 text-sm leading-6 text-notebook-muted">
                  Used as the initial game selection for future parties, battle logs, and notes.
                </p>
                <div className="mt-4 rounded-xl border border-notebook-border bg-notebook-card px-4 py-3 text-sm font-medium text-notebook-muted">
                  Static selection
                </div>
              </article>

              <article className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                  Default Rule
                </p>
                <p className="mt-3 text-lg font-semibold text-notebook-text">Single Battle</p>
                <p className="mt-2 text-sm leading-6 text-notebook-muted">
                  Used as the initial rule selection for future parties and battle logs.
                </p>
                <div className="mt-4 rounded-xl border border-notebook-border bg-notebook-card px-4 py-3 text-sm font-medium text-notebook-muted">
                  Static selection
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-3xl border border-notebook-border bg-notebook-card p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              Data Management
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Backup controls</h3>
            <p className="mt-2 text-sm leading-6 text-notebook-muted">
              Export or import Pokémon Battle Notebook data.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
                <h4 className="text-lg font-semibold text-notebook-text">Export Data</h4>
                <p className="mt-2 text-sm leading-6 text-notebook-muted">
                  Download a JSON backup containing Pokémon, parties, battle logs, and notes.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-5 w-full cursor-not-allowed rounded-xl border border-notebook-border bg-notebook-card px-4 py-3 text-sm font-semibold text-notebook-muted opacity-70"
                >
                  Export unavailable
                </button>
              </article>

              <article className="rounded-2xl border border-notebook-border bg-notebook-background p-5">
                <h4 className="text-lg font-semibold text-notebook-text">Import Data</h4>
                <p className="mt-2 text-sm leading-6 text-notebook-muted">
                  Restore Pokémon Battle Notebook data from a previously exported JSON file.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-5 w-full cursor-not-allowed rounded-xl border border-notebook-border bg-notebook-card px-4 py-3 text-sm font-semibold text-notebook-muted opacity-70"
                >
                  Import unavailable
                </button>
              </article>
            </div>

            <article className="mt-4 rounded-2xl border border-notebook-border bg-notebook-background p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-notebook-accent">
                Current Data Status
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-notebook-border bg-notebook-card p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-notebook-muted">
                    Storage
                  </dt>
                  <dd className="mt-2 font-semibold text-notebook-text">Static placeholder data</dd>
                </div>
                <div className="rounded-xl border border-notebook-border bg-notebook-card p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-notebook-muted">
                    Persistence
                  </dt>
                  <dd className="mt-2 font-semibold text-notebook-text">Not connected</dd>
                </div>
                <div className="rounded-xl border border-notebook-border bg-notebook-card p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-notebook-muted">
                    Backup
                  </dt>
                  <dd className="mt-2 font-semibold text-notebook-text">Not available</dd>
                </div>
              </dl>
            </article>
          </section>

          <section className="rounded-3xl border border-red-200 bg-red-50/60 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Danger Zone</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-notebook-text">
              Reset All Data
            </h3>
            <p className="mt-2 text-sm leading-6 text-notebook-muted">
              Actions in this section may permanently remove notebook data in a future version.
            </p>
            <p className="mt-4 text-sm leading-6 text-notebook-muted">
              Delete all Pokémon, parties, battle logs, research notes, damage notes, tags, and
              settings.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 cursor-not-allowed rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 opacity-70"
            >
              Reset unavailable
            </button>
            <p className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-700">
              No data will be changed from this static preview.
            </p>
          </section>

          <section className="rounded-3xl border border-notebook-border bg-notebook-card p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
              App Information
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Prototype status</h3>

            <dl className="mt-6 divide-y divide-notebook-border rounded-2xl border border-notebook-border bg-notebook-background">
              {appInformation.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]"
                >
                  <dt className="text-sm font-semibold text-notebook-muted">{item.label}</dt>
                  <dd className="text-sm font-semibold text-notebook-text sm:text-right">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-sm leading-6 text-notebook-muted">
              This prototype focuses on page structure and responsive UI. Formal TypeScript data
              models and persistence will be added in later phases.
            </p>
          </section>
        </main>
      </div>

      <section className="rounded-3xl border border-notebook-accent/30 bg-notebook-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Phase 3 UI Progress
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight">Core UI Mock Screens</h3>
        <p className="mt-4 text-sm leading-6 text-notebook-muted">
          10 of 11 issues completed before this screen. Completing this Settings UI finishes the
          Phase 3 screen set.
        </p>
        <p className="mt-4 rounded-xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm font-semibold text-notebook-text">
          Next: Phase 4 - Type System and Data Model
        </p>
      </section>

      <p className="rounded-2xl border border-dashed border-notebook-border bg-notebook-background px-5 py-4 text-sm leading-6 text-notebook-muted">
        These settings are static placeholders. Theme changes, default selections, data export,
        data import, reset actions, and setting persistence will be added in later issues.
      </p>
    </div>
  );
}

export default SettingsPage;
