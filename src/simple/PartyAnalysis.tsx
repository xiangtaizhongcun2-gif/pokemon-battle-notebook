import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ALL_TYPES } from "./data";
import { getTypeMultiplier } from "./matchups";
import type { AppState, Party, PokemonBuild, PokemonEntry, PokemonType } from "./model";
import { findMoveMetadata, type MoveMetadata, useMoveTypeCatalog } from "./moveTypeCatalog";
import { usePokedex } from "./pokedex";
import { TypeBadge } from "./Shared";
import { APP_STATE_CHANGED_EVENT, APP_STATE_STORAGE_KEY, getPokemon, readStoredState } from "./storage";

type Member = { build: PokemonBuild; pokemon: PokemonEntry };
type KnownMove = { member: Member; name: string; metadata?: MoveMetadata };
type DefenseRow = {
  type: PokemonType;
  weak: Member[];
  severe: Member[];
  resist: Member[];
  immune: Member[];
};
type CoverageRow = { type: PokemonType; answers: Array<{ member: Member; moves: string[] }> };

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function activePartyId(state: AppState): string | null {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>(".party-list-item")];
  const index = buttons.findIndex((button) => button.classList.contains("active"));
  return index < 0 ? null : state.parties[index]?.id ?? null;
}

function partyMembers(party: Party | undefined, pokedex: PokemonEntry[]): Member[] {
  return (party?.members ?? []).flatMap((build) => {
    const pokemon = getPokemon(build.speciesId, pokedex);
    return pokemon ? [{ build, pokemon }] : [];
  });
}

function names(members: Member[]): string {
  return members.map(({ pokemon }) => pokemon.name).join("、") || "—";
}

function moveMetadata(
  build: PokemonBuild,
  name: string,
  catalog: Record<string, MoveMetadata>,
): MoveMetadata | undefined {
  const result = findMoveMetadata(catalog, name);
  if (!result) return undefined;
  return normalize(name) === normalize("テラバースト")
    ? { ...result, type: build.teraType }
    : result;
}

export function PartyAnalysis() {
  const [state, setState] = useState<AppState>(() => readStoredState());
  const [partyId, setPartyId] = useState<string | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const { pokedex } = usePokedex();
  const { moves: catalog, status } = useMoveTypeCatalog();

  useEffect(() => {
    let host: HTMLDivElement | null = null;
    const refresh = () => {
      if (host && !host.isConnected) {
        host = null;
        setTarget(null);
      }
      const notes = document.querySelector<HTMLElement>(".party-editor > .notes-grid");
      if (notes && !host) {
        host = document.createElement("div");
        host.className = "party-analysis-host";
        notes.insertAdjacentElement("afterend", host);
        setTarget(host);
      }
      if (!notes && host) {
        host.remove();
        host = null;
        setTarget(null);
      }
      setPartyId(activePartyId(readStoredState()));
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      observer.disconnect();
      host?.remove();
    };
  }, []);

  useEffect(() => {
    const update = (event?: Event) => {
      const detail = event instanceof CustomEvent ? (event.detail as AppState | undefined) : undefined;
      const next = detail ?? readStoredState();
      setState(next);
      setPartyId(activePartyId(next));
    };
    const storage = (event: StorageEvent) => {
      if (event.key === APP_STATE_STORAGE_KEY) update();
    };
    window.addEventListener(APP_STATE_CHANGED_EVENT, update);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, update);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const party = state.parties.find((entry) => entry.id === partyId);
  const members = useMemo(() => partyMembers(party, pokedex), [party, pokedex]);
  const registeredMoves = useMemo<KnownMove[]>(
    () => members.flatMap((member) =>
      member.build.moves
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ member, name, metadata: moveMetadata(member.build, name, catalog) })),
    ),
    [catalog, members],
  );
  const attacks = registeredMoves.filter((move) => move.metadata?.category !== "status" && move.metadata);
  const statusCount = registeredMoves.filter((move) => move.metadata?.category === "status").length;
  const unknownCount = registeredMoves.filter((move) => !move.metadata).length;
  const physicalCount = attacks.filter((move) => move.metadata?.category === "physical").length;
  const specialCount = attacks.filter((move) => move.metadata?.category === "special").length;

  const defense = useMemo<DefenseRow[]>(() => ALL_TYPES.map((type) => {
    const values = members.map((member) => ({ member, value: getTypeMultiplier(type, member.pokemon.types) }));
    return {
      type,
      weak: values.filter(({ value }) => value >= 2).map(({ member }) => member),
      severe: values.filter(({ value }) => value >= 4).map(({ member }) => member),
      resist: values.filter(({ value }) => value > 0 && value < 1).map(({ member }) => member),
      immune: values.filter(({ value }) => value === 0).map(({ member }) => member),
    };
  }), [members]);

  const coverage = useMemo<CoverageRow[]>(() => ALL_TYPES.map((type) => ({
    type,
    answers: members.flatMap((member) => {
      const moveNames = attacks
        .filter((move) => move.member.build.id === member.build.id && move.metadata && getTypeMultiplier(move.metadata.type, [type]) > 1)
        .map((move) => move.name);
      return moveNames.length ? [{ member, moves: [...new Set(moveNames)] }] : [];
    }),
  })), [attacks, members]);

  if (!target || !party) return null;

  const concentrated = defense.filter((row) => row.weak.length >= 3);
  const noSwitch = defense.filter((row) => row.weak.length > 0 && row.resist.length + row.immune.length === 0);
  const gaps = coverage.filter((row) => row.answers.length === 0);
  const thin = coverage.filter((row) => row.answers.length === 1);

  return createPortal(
    <section className="party-analysis" aria-labelledby="party-analysis-title">
      <div className="party-analysis-heading">
        <div>
          <p className="eyebrow">PARTY CHECK</p>
          <h2 id="party-analysis-title">タイプ相性・技範囲分析</h2>
          <p>{party.name || "名前なし"}の登録内容から自動分析</p>
        </div>
        <span>{members.length} / 6匹</span>
      </div>

      {members.length === 0 ? (
        <p className="party-analysis-empty">ポケモンを追加すると分析結果が表示されます。</p>
      ) : (
        <>
          <div className="party-analysis-summary">
            <div><span>弱点集中</span><strong>{concentrated.length}</strong><small>タイプ</small></div>
            <div><span>受け先なし</span><strong>{noSwitch.length}</strong><small>タイプ</small></div>
            <div><span>認識した攻撃技</span><strong>{attacks.length}</strong><small>個</small></div>
            <div><span>攻撃範囲</span><strong>{18 - gaps.length}</strong><small>/ 18タイプ</small></div>
          </div>

          <div className="party-analysis-alerts">
            <p className={concentrated.length ? "danger" : "good"}>
              <strong>3匹以上の共通弱点：</strong>{concentrated.map((row) => `${row.type} ${row.weak.length}匹`).join("、") || "なし"}
            </p>
            <p className={noSwitch.length ? "warning" : "good"}>
              <strong>半減・無効の受け先がない弱点：</strong>{noSwitch.map((row) => row.type).join("、") || "なし"}
            </p>
            <p className={gaps.length ? "warning" : "good"}>
              <strong>弱点を突ける攻撃技がないタイプ：</strong>{gaps.map((row) => row.type).join("、") || "なし"}
            </p>
          </div>

          <div className="party-analysis-section">
            <div className="party-analysis-section-heading">
              <div><h3>防御タイプ相性</h3><p>相手の技タイプごとに通常時の相性を集計</p></div>
              <span>4倍弱点は弱点にも含む</span>
            </div>
            <div className="party-analysis-table-wrapper">
              <table className="party-analysis-table">
                <thead><tr><th>技タイプ</th><th>弱点</th><th>4倍</th><th>半減</th><th>無効</th><th>弱点のポケモン</th></tr></thead>
                <tbody>{defense.map((row) => {
                  const responses = row.resist.length + row.immune.length;
                  const level = row.weak.length >= 3 && responses === 0 ? "danger" : row.weak.length >= 3 || (row.weak.length >= 2 && responses === 0) ? "warning" : "balanced";
                  return <tr className={level} key={row.type}>
                    <th scope="row"><TypeBadge type={row.type} /></th>
                    <td><strong>{row.weak.length}</strong>匹</td><td>{row.severe.length}匹</td>
                    <td>{row.resist.length}匹</td><td>{row.immune.length}匹</td><td>{names(row.weak)}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </div>

          <div className="party-analysis-section">
            <div className="party-analysis-section-heading">
              <div><h3>攻撃技範囲</h3><p>各単タイプへ弱点を突ける登録済み攻撃技</p></div>
              <span>物理 {physicalCount}・特殊 {specialCount}</span>
            </div>
            <p className={`move-analysis-status ${status}`}>
              {status === "loading" && "技タイプデータを読み込み中です。"}
              {status === "ready" && `変化技${statusCount}個を除外・判定対象外${unknownCount}個`}
              {status === "fallback" && `取得できた技だけを集計中・判定対象外${unknownCount}個`}
            </p>
            <div className="party-analysis-table-wrapper">
              <table className="party-analysis-table coverage-analysis-table">
                <thead><tr><th>相手タイプ</th><th>対応数</th><th>ポケモンと技</th></tr></thead>
                <tbody>{coverage.map((row) => <tr className={row.answers.length === 0 ? "uncovered" : row.answers.length === 1 ? "thin" : "covered"} key={row.type}>
                  <th scope="row"><TypeBadge type={row.type} /></th>
                  <td><strong>{row.answers.length}</strong>匹</td>
                  <td>{row.answers.length ? row.answers.map(({ member, moves }) => `${member.pokemon.name}：${moves.join("・")}`).join(" / ") : "弱点を突ける攻撃技なし"}</td>
                </tr>)}</tbody>
              </table>
            </div>
            {thin.length > 0 && <p className="party-analysis-helper">1匹だけで対応：{thin.map((row) => row.type).join("、")}</p>}
          </div>

          <p className="party-analysis-note">通常時のタイプと登録済み技を基準にしています。テラスタル、特性、持ち物、天候、技の威力は考慮しません。テラバーストのみ登録したテラスタイプとして扱います。</p>
        </>
      )}
    </section>,
    target,
  );
}
