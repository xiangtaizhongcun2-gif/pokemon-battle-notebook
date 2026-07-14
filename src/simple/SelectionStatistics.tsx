import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, BattleLog, Party, PokemonBuild, PokemonEntry } from "./model";
import { usePokedex } from "./pokedex";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  getPokemon,
  readStoredState,
} from "./storage";

type SelectedMember = {
  build: PokemonBuild;
  pokemon: PokemonEntry;
};

type RecognizedSelection = {
  log: BattleLog;
  party: Party;
  members: SelectedMember[];
};

type MemberRecord = {
  party: Party;
  member: SelectedMember;
  denominator: number;
  selections: number;
  wins: number;
  losses: number;
  selectionRate: number;
  winRate: number;
};

type CombinationRecord = {
  key: string;
  party: Party;
  members: SelectedMember[];
  total: number;
  wins: number;
  losses: number;
  winRate: number;
};

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function splitSelection(value: string): string[] {
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

function getPartyMembers(party: Party, pokedex: PokemonEntry[]): SelectedMember[] {
  return party.members.flatMap((build) => {
    const pokemon = getPokemon(build.speciesId, pokedex);
    return pokemon ? [{ build, pokemon }] : [];
  });
}

function recognizeSelection(
  log: BattleLog,
  party: Party,
  pokedex: PokemonEntry[],
): SelectedMember[] {
  const members = getPartyMembers(party, pokedex);
  const lookup = new Map<string, SelectedMember>();

  members.forEach((member) => {
    [member.pokemon.name, member.pokemon.englishName].forEach((name) => {
      const key = normalize(name);
      if (key && !lookup.has(key)) lookup.set(key, member);
    });
  });

  const selected = new Map<string, SelectedMember>();
  splitSelection(log.ownSelection).forEach((token) => {
    const member = tokenCandidates(token)
      .map((candidate) => lookup.get(candidate))
      .find((candidate): candidate is SelectedMember => Boolean(candidate));
    if (member) selected.set(member.build.id, member);
  });

  return party.members
    .map((build) => selected.get(build.id))
    .filter((member): member is SelectedMember => Boolean(member));
}

function sameIds(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function SelectionStatistics() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [visibleLogIds, setVisibleLogIds] = useState<string[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [partyFilter, setPartyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const latestStateRef = useRef(appState);
  const { pokedex, status } = usePokedex();

  useEffect(() => {
    latestStateRef.current = appState;
  }, [appState]);

  const refreshVisibleLogIds = useCallback(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".log-list > .log-card"));
    const nextIds = cards
      .map((card, index) => (!card.hidden ? latestStateRef.current.battleLogs[index]?.id : undefined))
      .filter((id): id is string => Boolean(id));
    setVisibleLogIds((current) => (sameIds(current, nextIds) ? current : nextIds));
  }, []);

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const detail = (event as CustomEvent<AppState>).detail;
      const nextState = detail ?? readStoredState();
      latestStateRef.current = nextState;
      setAppState(nextState);
      window.requestAnimationFrame(refreshVisibleLogIds);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STATE_STORAGE_KEY) return;
      const nextState = readStoredState();
      latestStateRef.current = nextState;
      setAppState(nextState);
      window.requestAnimationFrame(refreshVisibleLogIds);
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshVisibleLogIds]);

  useEffect(() => {
    let host: HTMLDivElement | null = null;

    const refresh = () => {
      if (host && !host.isConnected) {
        host = null;
        setPortalTarget(null);
      }

      const opponentStatisticsHost = document.querySelector<HTMLElement>(
        ".opponent-pokemon-statistics-host",
      );
      const partyStatistics = document.querySelector<HTMLElement>(
        ".battle-statistics .party-statistics",
      );
      const anchor = opponentStatisticsHost ?? partyStatistics;

      if (anchor && host === null) {
        host = document.createElement("div");
        host.className = "selection-statistics-host";
        anchor.insertAdjacentElement("afterend", host);
        setPortalTarget(host);
      } else if (anchor && host && host.previousElementSibling !== anchor) {
        anchor.insertAdjacentElement("afterend", host);
      }

      if (!anchor && host !== null) {
        host.remove();
        host = null;
        setPortalTarget(null);
      }

      refreshVisibleLogIds();
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
  }, [refreshVisibleLogIds]);

  const visibleIdSet = useMemo(() => new Set(visibleLogIds), [visibleLogIds]);
  const visibleLogs = useMemo(
    () => appState.battleLogs.filter((log) => visibleIdSet.has(log.id)),
    [appState.battleLogs, visibleIdSet],
  );

  const recognizedSelections = useMemo<RecognizedSelection[]>(
    () =>
      visibleLogs.flatMap((log) => {
        const party = appState.parties.find((entry) => entry.id === log.partyId);
        if (!party) return [];
        const members = recognizeSelection(log, party, pokedex);
        return members.length > 0 ? [{ log, party, members }] : [];
      }),
    [appState.parties, pokedex, visibleLogs],
  );

  const recognizedCountsByParty = useMemo(() => {
    const counts = new Map<string, number>();
    recognizedSelections.forEach(({ party }) => {
      counts.set(party.id, (counts.get(party.id) ?? 0) + 1);
    });
    return counts;
  }, [recognizedSelections]);

  const memberRecords = useMemo<MemberRecord[]>(() => {
    const records = new Map<string, MemberRecord>();

    appState.parties.forEach((party) => {
      const denominator = recognizedCountsByParty.get(party.id) ?? 0;
      if (denominator === 0) return;
      getPartyMembers(party, pokedex).forEach((member) => {
        records.set(`${party.id}:${member.build.id}`, {
          party,
          member,
          denominator,
          selections: 0,
          wins: 0,
          losses: 0,
          selectionRate: 0,
          winRate: 0,
        });
      });
    });

    recognizedSelections.forEach(({ log, party, members }) => {
      members.forEach((member) => {
        const record = records.get(`${party.id}:${member.build.id}`);
        if (!record) return;
        record.selections += 1;
        if (log.result === "勝ち") record.wins += 1;
        else record.losses += 1;
        record.selectionRate = (record.selections / record.denominator) * 100;
        record.winRate = (record.wins / record.selections) * 100;
      });
    });

    return [...records.values()].sort(
      (left, right) =>
        right.denominator - left.denominator ||
        left.party.name.localeCompare(right.party.name, "ja") ||
        right.selections - left.selections ||
        left.member.pokemon.name.localeCompare(right.member.pokemon.name, "ja"),
    );
  }, [appState.parties, pokedex, recognizedCountsByParty, recognizedSelections]);

  const combinationRecords = useMemo<CombinationRecord[]>(() => {
    const records = new Map<string, CombinationRecord>();

    recognizedSelections.forEach(({ log, party, members }) => {
      const memberIds = members.map(({ build }) => build.id);
      const key = `${party.id}:${memberIds.join("|")}`;
      const record = records.get(key) ?? {
        key,
        party,
        members,
        total: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
      };
      record.total += 1;
      if (log.result === "勝ち") record.wins += 1;
      else record.losses += 1;
      record.winRate = (record.wins / record.total) * 100;
      records.set(key, record);
    });

    return [...records.values()].sort(
      (left, right) =>
        right.total - left.total ||
        right.wins - left.wins ||
        left.party.name.localeCompare(right.party.name, "ja"),
    );
  }, [recognizedSelections]);

  const availableParties = useMemo(
    () =>
      appState.parties.filter((party) => (recognizedCountsByParty.get(party.id) ?? 0) > 0),
    [appState.parties, recognizedCountsByParty],
  );

  useEffect(() => {
    if (partyFilter === "all") return;
    if (!availableParties.some((party) => party.id === partyFilter)) setPartyFilter("all");
  }, [availableParties, partyFilter]);

  const normalizedSearch = normalize(search);
  const filteredMemberRecords = memberRecords.filter((record) => {
    if (partyFilter !== "all" && record.party.id !== partyFilter) return false;
    if (!normalizedSearch) return true;
    return normalize(
      `${record.party.name} ${record.member.pokemon.name} ${record.member.pokemon.englishName} ${record.member.pokemon.number}`,
    ).includes(normalizedSearch);
  });

  const filteredCombinationRecords = combinationRecords.filter((record) => {
    if (partyFilter !== "all" && record.party.id !== partyFilter) return false;
    if (!normalizedSearch) return true;
    return normalize(
      `${record.party.name} ${record.members
        .map(({ pokemon }) => `${pokemon.name} ${pokemon.englishName} ${pokemon.number}`)
        .join(" ")}`,
    ).includes(normalizedSearch);
  });

  if (!portalTarget) return null;

  return createPortal(
    <section className="selection-statistics" aria-labelledby="selection-statistics-title">
      <div className="selection-statistics-heading">
        <div>
          <p className="statistics-eyebrow">SELECTION</p>
          <h3 id="selection-statistics-title">選出率・選出別勝率</h3>
          <p>現在の表示期間にある自分の選出から集計</p>
        </div>
        <span>{recognizedSelections.length} / {visibleLogs.length}件を認識</span>
      </div>

      <div className="selection-statistics-toolbar">
        <label>
          使用パーティ
          <select value={partyFilter} onChange={(event) => setPartyFilter(event.target.value)}>
            <option value="all">すべてのパーティ</option>
            {availableParties.map((party) => (
              <option value={party.id} key={party.id}>
                {party.name || "名前なし"}
              </option>
            ))}
          </select>
        </label>
        <label>
          名前で検索
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ポケモン名・英語名・図鑑番号"
          />
        </label>
      </div>

      {status === "loading" && memberRecords.length === 0 ? (
        <p className="statistics-empty">全国図鑑を読み込み中です。</p>
      ) : memberRecords.length === 0 ? (
        <p className="statistics-empty">
          対戦記録へ自分の選出を登録すると、選出率と選出時勝率が表示されます。
        </p>
      ) : filteredMemberRecords.length === 0 ? (
        <p className="statistics-empty">検索条件に一致する選出記録はありません。</p>
      ) : (
        <div className="selection-statistics-block">
          <h4>ポケモン別</h4>
          <div className="statistics-table-wrapper selection-member-table-wrapper">
            <table className="statistics-table selection-member-table">
              <thead>
                <tr>
                  <th>パーティ</th>
                  <th>ポケモン</th>
                  <th>選出</th>
                  <th>選出率</th>
                  <th>勝ち</th>
                  <th>負け</th>
                  <th>選出時勝率</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberRecords.map((record) => (
                  <tr key={`${record.party.id}:${record.member.build.id}`}>
                    <th scope="row">{record.party.name || "名前なし"}</th>
                    <td>
                      <span className="selection-pokemon-name">
                        <strong>{record.member.pokemon.name}</strong>
                        <small>No.{String(record.member.pokemon.number).padStart(4, "0")}</small>
                      </span>
                    </td>
                    <td>{record.selections} / {record.denominator}</td>
                    <td>{formatPercent(record.selectionRate)}</td>
                    <td>{record.wins}</td>
                    <td>{record.losses}</td>
                    <td>
                      <span className={record.selections > 0 && record.winRate < 50 ? "selection-low-rate" : ""}>
                        {record.selections === 0 ? "—" : formatPercent(record.winRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCombinationRecords.length > 0 && (
        <div className="selection-statistics-block">
          <h4>組み合わせ別</h4>
          <div className="statistics-table-wrapper selection-combination-table-wrapper">
            <table className="statistics-table selection-combination-table">
              <thead>
                <tr>
                  <th>パーティ</th>
                  <th>選出した組み合わせ</th>
                  <th>対戦</th>
                  <th>勝ち</th>
                  <th>負け</th>
                  <th>勝率</th>
                </tr>
              </thead>
              <tbody>
                {filteredCombinationRecords.map((record) => (
                  <tr key={record.key}>
                    <th scope="row">{record.party.name || "名前なし"}</th>
                    <td>
                      <span className="selection-combination-names">
                        {record.members.map(({ pokemon }) => pokemon.name).join(" ＋ ")}
                      </span>
                    </td>
                    <td>{record.total}</td>
                    <td>{record.wins}</td>
                    <td>{record.losses}</td>
                    <td>
                      <span className={record.winRate < 50 ? "selection-low-rate" : ""}>
                        {formatPercent(record.winRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="selection-statistics-note">
        選出率は、同じパーティで選出内容を認識できた対戦数を分母にしています。空欄や図鑑名と一致しない自由文は分母から除外されます。
      </p>
    </section>,
    portalTarget,
  );
}
