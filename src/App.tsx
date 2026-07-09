import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <AppLayout>
      <section className="rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 shadow-xl shadow-slate-900/10 sm:px-16 sm:py-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Main content area
        </p>
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">Pokémon Battle Notebook</h2>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-notebook-muted sm:text-xl">
          Notion-like Pokémon battle knowledge workspace
        </p>
      </section>
    </AppLayout>
  );
}

export default App;
