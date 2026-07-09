function App() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-notebook-background px-6 py-10 text-notebook-text"
      aria-labelledby="app-title"
    >
      <section className="w-full max-w-3xl rounded-3xl border border-notebook-border bg-notebook-card px-8 py-12 text-center shadow-xl shadow-slate-900/10 sm:px-16 sm:py-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
          Issue #001 Project Setup Complete
        </p>
        <h1 id="app-title" className="text-4xl font-bold tracking-tight sm:text-6xl">
          Pokémon Battle Notebook
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-notebook-muted sm:text-xl">
          Notion-like Pokémon battle knowledge workspace
        </p>
      </section>
    </main>
  );
}

export default App;
