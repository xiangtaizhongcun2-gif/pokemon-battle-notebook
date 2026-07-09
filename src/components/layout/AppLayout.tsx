import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-notebook-background text-notebook-text">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[17rem_1fr]">
        <Sidebar />

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
