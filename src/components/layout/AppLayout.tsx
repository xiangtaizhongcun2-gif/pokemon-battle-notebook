import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-notebook-background text-notebook-text">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[17rem_1fr]">
        <aside className="border-b border-notebook-border bg-notebook-card/80 px-5 py-4 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-notebook-accent">
                Workspace
              </p>
              <p className="mt-2 text-lg font-semibold">Battle Notebook</p>
            </div>
            <p className="rounded-full border border-notebook-border px-3 py-1 text-xs text-notebook-muted lg:mt-6 lg:inline-block">
              Sidebar area
            </p>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="border-b border-notebook-border bg-notebook-card/70 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-notebook-muted">Header area</p>
                <h1 className="text-xl font-semibold tracking-tight">Pokémon Battle Notebook</h1>
              </div>
              <p className="text-sm text-notebook-muted">Notion-like workspace foundation</p>
            </div>
          </header>

          <main className="flex-1 px-5 py-8 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
