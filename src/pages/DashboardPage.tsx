function DashboardPage() {
  return (
    <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-16 sm:py-20">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
        Dashboard
      </p>
      <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">Pokémon Battle Notebook</h2>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-notebook-muted sm:text-xl">
        Notion-like Pokémon battle knowledge workspace
      </p>
      <p className="mt-8 rounded-2xl border border-notebook-border bg-notebook-background px-4 py-3 text-sm text-notebook-muted">
        Overview of your Pokémon battle notes will appear here.
      </p>
    </section>
  );
}

export default DashboardPage;
