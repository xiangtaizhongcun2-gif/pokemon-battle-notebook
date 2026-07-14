import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, BattleLog, PokemonEntry } from "./model";
import { usePokedex } from "./pokedex";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  readStoredState,
} from "./storage";

type PokemonRecord = {
  pokemon: PokemonEntry;
  total: number;
  wins: number;
  losses: number;
  winRate: number;
};

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function splitTeamText(value: string): string[] {
  return value
    .split(/[、,，\n/／;；]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function tokenCandidates(token: string): string[] {
  const normalized = normalize(token);
  const withoutAnnotation = normalized.replace(/\s*[（(【\[].*$/, "").trim();
  return withoutAnnotation && withoutAnnotation !== normalized
    ? [normalized, withoutAnnotation]
    : [normalized];
}

function createPokemonLookup(pokedex: PokemonEntry[]): Map<string, PokemonEntry> {
  const lookup = new Map<string, PokemonEntry>();

  pokedex.forEach((pokemon) => {
    const names = [pokemon.name, pokemon.englishName];
    names.forEach((name) => {
      const key = normalize(name);
      if (key && !lookup.has(key)) lookup.set(key, pokemon);
    });
  });

  return lookup;
}

function extractOpponentPokemon(
  log: BattleLog,
  lookup: Map<string, PokemonEntry>,
): PokemonEntry[] {
  const selected = new Map<string, PokemonEntry>();

  splitTeamText(log.opponentTeam).forEach((token) => {
    const pokemon = tokenCandidates(token)
      .map((candidate) => lookup.get(candidate))
      .find((candidate): candidate is PokemonEntry => Boolean(candidate));

    if (pokemon) selected.set(pokemon.id, pokemon);
  });

  return [...selected.values()];
}

function formatWinRate(record: PokemonRecord): string {
  return `${record.winRate.toFixed(1)}%`;
}

function sameLogIds(left: BattleLog[], right: BattleLog[]): boolean {
  return left.length === right.length && left.every((log, index) => log.id === right[index]?.id);
}

export function OpponentPokemonStatistics() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [visibleLogs, setVisibleLogs] = useState<BattleLog[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const latestStateRef = useRef(appState);
  const { pokedex, status } = usePokedex();

  useEffect(() => {
    latestStateRef.current = appState;
  }, [appState]);

  const refreshVisibleLogs = useCallback(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".log-list > .log-card"));
    const currentState = latestStateRef.current;
    const nextLogs = cards
      .map((card, index) => (!card.hidden ? currentState.battleLogs[index] : undefined))
      .filter((log): log is BattleLog => Boolean(log));

    setVisibleLogs((current) => (sameLogIds(current, nextLogs) ? current : nextLogs));
  }, []);

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const detail = (event as CustomEvent<AppState>).detail;
      const nextState = detail ?? readStoredState();
      latestStateRef.current = nextState;
      setAppState(nextState);
      window.requestAnimationFrame(refreshVisibleLogs);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STATE_STORAGE_KEY) return;
      const nextState = readStoredState();
      latestStateRef.current = nextState;
      setAppState(nextState);
      window.requestAnimationFrame(refreshVisibleLogs);
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshVisibleLogs]);

  useEffect(() => {
    let host: HTMLDivElement | null = null;

    const refresh = () => {
      if (host && !host.isConnected) {
        host = null;
        setPortalTarget(null);
      }

      const partyStatistics = document.querySelector<HTMLElement>(
        ".battle-statistics .party-statistics",
      );

      if (partyStatistics && host === null) {
        host = document.createElement("div");
        host.className = "opponent-pokemon-statistics-host";
        partyStatistics.insertAdjacentElement("afterend", host);
        setPortalTarget(host);
      }

      if (!partyStatistics && host !== null) {
        host.remove();
        host = null;
        setPortalTarget(null);
      }

      refreshVisibleLogs();
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });

    return () => {
      observer.disconnect();
      host?.remove();
    };
  }, [refreshVisibleLogs]);

  const lookup = useMemo(() => createPokemonLookup(pokedex), [pokedex]);

  const recognizedLogs = useMemo(
    () =>
      visibleLogs.map((log) => ({
        log,
        pokemon: extractOpponentPokemon(log, lookup),
      })),
    [lookup, visibleLogs],
  );

  const records = useMemo(() => {
    const recordMap = new Map<string, PokemonRecord>();

    recognizedLogs.forEach(({ log, pokemon }) => {
      pokemon.forEach((entry) => {
        const current = recordMap.get(entry.id) ?? {
          pokemon: entry,
          total: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
        };
        current.total += 1;
        if (log.result === "勝ち") current.wins += 1;
        else current.losses += 1;
        current.winRate = (current.wins / current.total) * 100;
        recordMap.set(entry.id, current);
      });
    });

    return [...recordMap.values()].sort(
      (left, right) =>
        right.total - left.total ||
        right.losses - left.losses ||
        left.pokemon.name.localeCompare(right.pokemon.name, "ja"),
    );
  }, [recognizedLogs]);

  const filteredRecords = useMemo(() => {
    const query = normalize(search);
    if (!query) return records;

    return records.filter((record) =>
      normalize(
        `${record.pokemon.name} ${record.pokemon.englishName} ${record.pokemon.number}`,
      ).includes(query),
    );
  }, [records, search]);

  const recognizedLogCount = useMemo(
    () => recognizedLogs.filter(({ pokemon }) => pokemon.length > 0).length,
    [recognizedLogs],
  );

  if (!portalTarget) return null;

  return createPortal(
    <section className="opponent-pokemon-statistics" aria-labelledby="opponent-records-title">
      <div className="opponent-records-heading">
        <div>
          <p className="statistics-eyebrow">MATCHUPS</p>
          <h3 id="opponent-records-title">相手ポケモン別戦績</h3>
          <p>現在の表示期間にある対戦履歴から集計</p>
        </div>
        <span>
          {recognizedLogCount} / {visibleLogs.length}件を認識
        </span>
      </div>

      <div className="opponent-records-toolbar">
        <label>
          ポケモンを検索
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="名前・英語名・図鑑番号"
            aria-label="相手ポケモン別戦績を検索"
          />
        </label>
        <p>{filteredRecords.length}匹を表示</p>
      </div>

      {status === "loading" && records.length === 0 ? (
        <p className="statistics-empty">全国図鑑を読み込み中です。</p>
      ) : records.length === 0 ? (
        <p className="statistics-empty">
          相手パーティへポケモンを登録すると、ポケモン別の戦績が表示されます。
        </p>
      ) : filteredRecords.length === 0 ? (
        <p className="statistics-empty">検索条件に一致するポケモンはありません。</p>
      ) : (
        <div className="statistics-table-wrapper opponent-records-table-wrapper">
          <table className="statistics-table opponent-records-table">
            <thead>
              <tr>
                <th>ポケモン</th>
                <th>対戦</th>
                <th>勝ち</th>
                <th>負け</th>
                <th>勝率</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.pokemon.id}>
                  <th scope="row">
                    <span className="opponent-record-pokemon">
                      <small>No.{String(record.pokemon.number).padStart(4, "0")}</small>
                      <strong>{record.pokemon.name}</strong>
                      <small>{record.pokemon.englishName}</small>
                    </span>
                  </th>
                  <td>{record.total}</td>
                  <td>{record.wins}</td>
                  <td>{record.losses}</td>
                  <td>
                    <span className={record.winRate < 50 ? "low-win-rate" : ""}>
                      {formatWinRate(record)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="opponent-records-note">
        同じ対戦内の同一ポケモンは1戦として数えます。区切りのない補足文など、図鑑名と一致しない部分は集計されません。
      </p>
    </section>,
    portalTarget,
  );
}
