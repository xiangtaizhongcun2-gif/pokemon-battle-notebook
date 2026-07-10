import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import BattleLogsPage from "./pages/BattleLogsPage";
import DamageNotesPage from "./pages/DamageNotesPage";
import DashboardPage from "./pages/DashboardPage";
import PartiesPage from "./pages/PartiesPage";
import PokedexPage from "./pages/PokedexPage";
import PokemonDetailPage from "./pages/PokemonDetailPage";
import ResearchNotesPage from "./pages/ResearchNotesPage";
import SettingsPage from "./pages/SettingsPage";
import TagsPage from "./pages/TagsPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pokedex" element={<PokedexPage />} />
        <Route path="/pokedex/dragonite" element={<PokemonDetailPage />} />
        <Route path="/parties" element={<PartiesPage />} />
        <Route path="/battle-logs" element={<BattleLogsPage />} />
        <Route path="/research-notes" element={<ResearchNotesPage />} />
        <Route path="/damage-notes" element={<DamageNotesPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
