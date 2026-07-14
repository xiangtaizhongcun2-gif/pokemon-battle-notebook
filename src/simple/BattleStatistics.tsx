import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, BattleLog } from "./model";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  readStoredState,
} from "./storage";

type RecordSummary = {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
};

function summarize(logs: BattleLog[]): RecordSummary {
  const wins = logs.filter((log) => log.result === "勝ち").length;
  const total = logs.length;

  return {
    total,
    wins,
    losses: total - wins,
    winRate: total === 0 ? 0 : (wins / total) * 100,
  };
}

function formatWinRate(summary: RecordSummary): string {
  return `${summary.winRate.toFixed(1)}%`;
}

export function BattleStatistics() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const detail = (event as CustomEvent<AppState>).detail;
      setAppState(detail ?? readStoredState());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === APP_STATE_STORAGE_KEY) {
        setAppState(readStoredState());
      }
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    let host: HTMLDivElement | null = null;

    const attachToHistoryPage = () => {
      const historyLayout = document.querySelector<HTMLElement>(".history-layout");

      if (historyLayout && host === null) {
        const parent = historyLayout.parentElement;
        if (!parent) return;

        host = document.createElement("div");
        host.className = "battle-statistics-host";
        parent.insertBefore(host, historyLayout);
        setPortalTarget(host);
        return;
      }

      if (!historyLayout && host !== null) {
        host.remove();
        host = null;
        setPortalTarget(null);
      }
    };

    attachToHistoryPage();
    const observer = new MutationObserver(attachToHistoryPage);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      host?.remove();
    };
  }, []);

  const overall = useMemo(() => summarize(appState.battleLogs), [appState.battleLogs]);
  const partyRecords = useMemo(
    () =>
      appState.parties
        .map((party) => ({
          party,
          summary: summarize(appState.battleLogs.filter((log) => log.partyId === party.id)),
        }))
        .sort(
          (left, right) =>
            right.summary.total - left.summary.total ||
            right.summary.wins - left.summary.wins ||
            left.party.name.localeCompare(right.party.name, "ja"),
        ),
    [appState.battleLogs, appState.parties],
  );

  if (!portalTarget) return null;

  return createPortal(
    <section className="battle-statistics" aria-labelledby="battle-statistics-title">
      <div className="statistics-heading">
        <div>
          <p className="statistics-eyebrow">PERFORMANCE</p>
          <h2 id="battle-statistics-title">勝率集計</h2>
        </div>
        <p>対戦履歴から自動集計</p>
      </div>

      <div className="statistics-grid">
        <div className="statistic-card">
          <span>総対戦数</span>
          <strong>{overall.total}</strong>
          <small>戦</small>
        </div>
        <div className="statistic-card">
          <span>勝ち</span>
          <strong>{overall.wins}</strong>
          <small>勝</small>
        </div>
        <div className="statistic-card">
          <span>負け</span>
          <strong>{overall.losses}</strong>
          <small>敗</small>
        </div>
        <div className="statistic-card win-rate-card">
          <span>勝率</span>
          <strong>{formatWinRate(overall)}</strong>
        </div>
      </div>

      <div className="party-statistics">
        <h3>パーティ別戦績</h3>
        {partyRecords.length === 0 ? (
          <p className="statistics-empty">パーティを作成すると、パーティ別の勝率が表示されます。</p>
        ) : (
          <div className="statistics-table-wrapper">
            <table className="statistics-table">
              <thead>
                <tr>
                  <th>パーティ</th>
                  <th>対戦</th>
                  <th>勝ち</th>
                  <th>負け</th>
                  <th>勝率</th>
                </tr>
              </thead>
              <tbody>
                {partyRecords.map(({ party, summary }) => (
                  <tr key={party.id}>
                    <th scope="row">{party.name || "名前なし"}</th>
                    <td>{summary.total}</td>
                    <td>{summary.wins}</td>
                    <td>{summary.losses}</td>
                    <td>{formatWinRate(summary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>,
    portalTarget,
  );
}
