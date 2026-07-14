import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
import "./battle-statistics.css";
import "./build-suggestions.css";
import "./champions-training.css";
import "./opponent-team-search.css";
import "./data-backup.css";
import "./speed-comparison.css";
import { BattleStatistics } from "./simple/BattleStatistics";
import { OpponentTeamSearch } from "./simple/OpponentTeamSearch";
import { DataBackupManager } from "./simple/DataBackupManager";
import { PartyCopyAction } from "./simple/PartyCopyAction";
import { SpeedComparison } from "./simple/SpeedComparison";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <OpponentTeamSearch />
    <BattleStatistics />
    <DataBackupManager />
    <PartyCopyAction />
    <SpeedComparison />
  </StrictMode>,
);
