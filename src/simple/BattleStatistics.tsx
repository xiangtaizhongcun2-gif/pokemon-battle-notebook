import { useCallback, useEffect, useMemo, useState } from "react";
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

type DatePreset = "all" | "7days" | "30days" | "month" | "custom";

const DATE_PRESETS: { value: Exclude<DatePreset, "custom">; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "7days", label: "過去7日" },
  { value: "30days", label: "過去30日" },
  { value: "month", label: "今月" },
];

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

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPresetRange(preset: Exclude<DatePreset, "custom">): {
  startDate: string;
  endDate: string;
} {
  if (preset === "all") return { startDate: "", endDate: "" };

  const today = new Date();
  const endDate = formatDateInput(today);

  if (preset === "month") {
    return {
      startDate: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate,
    };
  }

  const days = preset === "7days" ? 7 : 30;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - (days - 1));
  return { startDate: formatDateInput(start), endDate };
}

function matchesDateRange(log: BattleLog, startDate: string, endDate: string): boolean {
  if (startDate && log.date < startDate) return false;
  if (endDate && log.date > endDate) return false;
  return true;
}

function getPeriodLabel(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "全期間";
  if (startDate && endDate) return `${startDate} 〜 ${endDate}`;
  if (startDate) return `${startDate} 以降`;
  return `${endDate} まで`;
}

export function BattleStatistics() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [preset, setPreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const invalidRange = Boolean(startDate && endDate && startDate > endDate);

  const filteredLogs = useMemo(() => {
    if (invalidRange) return [];
    return appState.battleLogs.filter((log) => matchesDateRange(log, startDate, endDate));
  }, [appState.battleLogs, endDate, invalidRange, startDate]);

  const visibleLogIds = useMemo(() => new Set(filteredLogs.map((log) => log.id)), [filteredLogs]);

  const filterRenderedHistory = useCallback(() => {
    const cards = document.querySelectorAll<HTMLElement>(".log-list > .log-card");
    cards.forEach((card, index) => {
      const log = appState.battleLogs[index];
      card.hidden = !log || !visibleLogIds.has(log.id);
    });
  }, [appState.battleLogs, visibleLogIds]);

  useEffect(() => {
    filterRenderedHistory();

    const root = document.getElementById("root");
    if (!root) return;

    const observer = new MutationObserver(filterRenderedHistory);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [filterRenderedHistory]);

  const overall = useMemo(() => summarize(filteredLogs), [filteredLogs]);
  const partyRecords = useMemo(
    () =>
      appState.parties
        .map((party) => ({
          party,
          summary: summarize(filteredLogs.filter((log) => log.partyId === party.id)),
        }))
        .sort(
          (left, right) =>
            right.summary.total - left.summary.total ||
            right.summary.wins - left.summary.wins ||
            left.party.name.localeCompare(right.party.name, "ja"),
        ),
    [appState.parties, filteredLogs],
  );

  const applyPreset = (nextPreset: Exclude<DatePreset, "custom">) => {
    const range = getPresetRange(nextPreset);
    setPreset(nextPreset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const clearFilter = () => applyPreset("all");

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

      <div className="history-date-filter" aria-labelledby="history-date-filter-title">
        <div className="date-filter-heading">
          <div>
            <h3 id="history-date-filter-title">表示期間</h3>
            <p>{getPeriodLabel(startDate, endDate)}</p>
          </div>
          <span>{filteredLogs.length} / {appState.battleLogs.length}件表示</span>
        </div>

        <div className="date-preset-group" aria-label="期間プリセット">
          {DATE_PRESETS.map((option) => (
            <button
              className={preset === option.value ? "date-preset-button active" : "date-preset-button"}
              type="button"
              key={option.value}
              onClick={() => applyPreset(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="date-range-controls">
          <label>
            開始日
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPreset("custom");
              }}
            />
          </label>
          <span className="date-range-separator" aria-hidden="true">〜</span>
          <label>
            終了日
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPreset("custom");
              }}
            />
          </label>
          <button
            className="secondary-button date-filter-clear"
            type="button"
            onClick={clearFilter}
            disabled={preset === "all" && !startDate && !endDate}
          >
            絞り込みを解除
          </button>
        </div>

        {invalidRange && (
          <p className="date-filter-message error" role="alert">
            開始日は終了日以前の日付を指定してください。
          </p>
        )}
        {!invalidRange && appState.battleLogs.length > 0 && filteredLogs.length === 0 && (
          <p className="date-filter-message">指定した期間に対戦記録はありません。</p>
        )}
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
