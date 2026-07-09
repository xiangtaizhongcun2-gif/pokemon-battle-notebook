const dashboardCards = [
  {
    title: "Recent Notes",
    description: "Your recently edited battle notes will appear here.",
  },
  {
    title: "Favorite Pokémon",
    description: "Pinned Pokémon and frequently checked profiles will appear here.",
  },
  {
    title: "Battle Logs",
    description: "Recent match records and reflections will appear here.",
  },
  {
    title: "Research Notes",
    description: "Metagame research, matchup notes, and strategy ideas will appear here.",
  },
  {
    title: "Quick Actions",
    description: "Shortcuts for creating notes and jumping into key workflows will appear here.",
  },
];

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-16 sm:py-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Dashboard
        </p>
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">Pokémon Battle Notebook</h2>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-notebook-muted sm:text-xl">
          Notion-like Pokémon battle knowledge workspace
        </p>
        <p className="mt-8 max-w-3xl rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm leading-6 text-notebook-muted">
          Overview of your Pokémon battle notes will appear here.
        </p>
      </section>

      <section aria-labelledby="dashboard-sections-title" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
            Workspace overview
          </p>
          <h3 id="dashboard-sections-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Dashboard sections
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-notebook-border bg-notebook-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-base font-semibold text-notebook-text">{card.title}</p>
              <p className="mt-3 text-sm leading-6 text-notebook-muted">{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
