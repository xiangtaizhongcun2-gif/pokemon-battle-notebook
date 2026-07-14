import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
import "./battle-statistics.css";
import "./build-suggestions.css";
import "./champions-training.css";
import { BattleStatistics } from "./simple/BattleStatistics";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <BattleStatistics />
  </StrictMode>,
);
