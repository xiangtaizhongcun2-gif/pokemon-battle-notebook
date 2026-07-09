import type { ReactNode } from "react";
import Header from "./Header";
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
          <Header />

          <main className="flex-1 px-5 py-8 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
