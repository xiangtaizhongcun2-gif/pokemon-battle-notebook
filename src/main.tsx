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
import "./opponent-pokemon-statistics.css";
import "./selection-statistics.css";
import "./party-analysis.css";
import "./build-templates.css";
import "./damage-calculator.css";
import { BattleStatistics } from "./simple/BattleStatistics";
import { OpponentTeamSearch } from "./simple/OpponentTeamSearch";
import { DataBackupManager } from "./simple/DataBackupManager";
import { PartyCopyAction } from "./simple/PartyCopyAction";
import { SpeedComparison } from "./simple/SpeedComparison";
import { OpponentPokemonStatisticsMount } from "./simple/OpponentPokemonStatisticsMount";
import { OwnSelectionPicker } from "./simple/OwnSelectionPicker";
import { SelectionStatistics } from "./simple/SelectionStatistics";
import { PartyAnalysis } from "./simple/PartyAnalysis";
import { BuildTemplateManager } from "./simple/BuildTemplateManager";
import { DamageCalculatorMount } from "./simple/DamageCalculatorMount";
import { DamageMoveOptionsEnhancer } from "./simple/DamageMoveOptionsEnhancer";
import { DamageMoveOptionsStyles } from "./simple/DamageMoveOptionsStyles";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <DamageMoveOptionsStyles />
    <DamageCalculatorMount />
    <DamageMoveOptionsEnhancer />
    <BuildTemplateManager />
    <OwnSelectionPicker />
    <OpponentTeamSearch />
    <BattleStatistics />
    <OpponentPokemonStatisticsMount />
    <SelectionStatistics />
    <DataBackupManager />
    <PartyCopyAction />
    <SpeedComparison />
    <PartyAnalysis />
  </StrictMode>,
);
