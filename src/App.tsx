import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BuildEditor } from "./simple/BuildEditor";
import { POKEDEX } from "./simple/data";
import type { BattleLog, FieldChangeEvent, Party, PokemonBuild, PokemonEntry, View } from "./simple/model";
import { usePokedex } from "./simple/pokedex";
import { MatchupList, StatTable, TypeBadge } from "./simple/Shared";
import { createId, emptyStats, getPokemon, useStoredState } from "./simple/storage";

function App() {
  const [state, setState] = useStoredState();
  const { pokedex, status: pokedexStatus, error: pokedexError } = usePokedex();
  const [view, setView] = useState<View>("parties");
  const [selectedPartyId, setSelectedPartyId] = useState(state.parties[0]?.id ?? "");
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPokemonId, setSelectedPokemonId] = useState(POKEDEX[0].id);
  const [targetPartyId, setTargetPartyId] = useState(state.parties[0]?.id ?? "");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const selectedParty = state.parties.find((party) => party.id === selectedPartyId) ?? state.parties[0];
  const editingBuild = selectedParty?.members.find((member) => member.id === editingBuildId);
  const selectedPokemon = getPokemon(selectedPokemonId, pokedex) ?? pokedex[0] ?? POKEDEX[0];

  const filteredPokemon = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return pokedex;
    return pokedex.filter((pokemon) =>
      `${pokemon.name} ${pokemon.englishName} ${pokemon.number}`.toLowerCase().includes(normalized),
    );
  }, [pokedex, search]);

  useEffect(() => {
    if (!pokedex.some((pokemon) => pokemon.id === selectedPokemonId)) {
      setSelectedPokemonId(pokedex[0]?.id ?? POKEDEX[0].id);
    }
  }, [pokedex, selectedPokemonId]);

  useEffect(() => {
    if (state.parties.length === 0) {
      setSelectedPartyId("");
      setTargetPartyId("");
      return;
    }
    if (!state.parties.some((party) => party.id === selectedPartyId)) {
      setSelectedPartyId(state.parties[0].id);
    }
    if (!state.parties.some((party) => party.id === targetPartyId)) {
      setTargetPartyId(state.parties[0].id);
    }
  }, [selectedPartyId, state.parties, targetPartyId]);

  const addParty = () => {
    const party: Party = {
      id: createId("party"),
      name: "新しいパーティ",
      concept: "",
      selectionNotes: "",
      difficultMatchups: "",
      members: [],
    };
    setState((current) => ({ ...current, parties: [...current.parties, party] }));
    setSelectedPartyId(party.id);
    setTargetPartyId(party.id);
    setView("parties");
  };

  const updateParty = (partyId: string, patch: Partial<Party>) => {
    setState((current) => ({
      ...current,
      parties: current.parties.map((party) => (party.id === partyId ? { ...party, ...patch } : party)),
    }));
  };

  const deleteParty = (partyId: string) => {
    if (!window.confirm("このパーティを削除しますか？")) return;
    setState((current) => ({
      parties: current.parties.filter((party) => party.id !== partyId),
      battleLogs: current.battleLogs.filter((log) => log.partyId !== partyId),
    }));
    setEditingBuildId(null);
  };

  const addPokemonToParty = (pokemon: PokemonEntry) => {
    const target = state.parties.find((party) => party.id === targetPartyId);
    if (!target) {
      window.alert("先にパーティを作成してください。");
      return;
    }
    if (target.members.length >= 6) {
      window.alert("1つのパーティに登録できるのは6匹までです。");
      return;
    }

    const build: PokemonBuild = {
      id: createId("build"),
      speciesId: pokemon.id,
      ability: pokemon.abilities[0] ?? "",
      item: "",
      nature: "まじめ",
      teraType: pokemon.types[0],
      moves: ["", "", "", ""],
      evs: emptyStats(),
      memo: "",
    };

    updateParty(target.id, { members: [...target.members, build] });
    setSelectedPartyId(target.id);
    setEditingBuildId(build.id);
    setView("parties");
  };

  const updateBuild = (buildId: string, patch: Partial<PokemonBuild>) => {
    if (!selectedParty) return;
    updateParty(selectedParty.id, {
      members: selectedParty.members.map((member) => (member.id === buildId ? { ...member, ...patch } : member)),
    });
  };

  const deleteBuild = (buildId: string) => {
    if (!selectedParty) return;
    updateParty(selectedParty.id, {
      members: selectedParty.members.filter((member) => member.id !== buildId),
    });
    setEditingBuildId(null);
  };

  const saveBattleLog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const log: BattleLog = {
      id: editingLogId ?? createId("log"),
      date: String(form.get("date") ?? ""),
      result: form.get("result") === "負け" ? "負け" : "勝ち",
      partyId: String(form.get("partyId") ?? ""),
      ownSelection: String(form.get("ownSelection") ?? ""),
      opponentTeam: String(form.get("opponentTeam") ?? ""),
      memo: String(form.get("memo") ?? ""),
    };

    setState((current) => ({
      ...current,
      battleLogs: editingLogId
        ? current.battleLogs.map((item) => (item.id === editingLogId ? log : item))
        : [log, ...current.battleLogs],
    }));
    setEditingLogId(null);
    event.currentTarget.reset();
  };

  const editingLog = state.battleLogs.find((log) => log.id === editingLogId);

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" type="button" onClick={() => setView("parties")}>
          Pokémon Battle Notebook
        </button>
        <nav aria-label="メインメニュー">
          <button
            className={view === "parties" ? "nav-button active" : "nav-button"}
            type="button"
            onClick={() => setView("parties")}
          >
            パーティ
          </button>
          <button
            className={view === "pokedex" ? "nav-button active" : "nav-button"}
            type="button"
            onClick={() => setView("pokedex")}
          >
            ポケモン図鑑
          </button>
          <button
            className={view === "history" ? "nav-button active" : "nav-button"}
            type="button"
            onClick={() => setView("history")}
          >
            対戦履歴
          </button>
        </nav>
      </header>

      <main className="page">
        {view === "parties" && (
          <section>
            <div className="page-heading">
              <div>
                <p className="eyebrow">PARTIES</p>
                <h1>パーティ</h1>
              </div>
              <button className="primary-button" type="button" onClick={addParty}>
                ＋ 新規作成
              </button>
            </div>

            {state.parties.length === 0 ? (
              <div className="empty-state">
                <h2>パーティがありません</h2>
                <p>最初のパーティを作成して、ポケモンを登録しましょう。</p>
                <button className="primary-button" type="button" onClick={addParty}>
                  パーティを作る
                </button>
              </div>
            ) : (
              <div className="party-layout">
                <aside className="party-list" aria-label="パーティ一覧">
                  {state.parties.map((party) => (
                    <button
                      className={party.id === selectedParty?.id ? "party-list-item active" : "party-list-item"}
                      type="button"
                      key={party.id}
                      onClick={() => {
                        setSelectedPartyId(party.id);
                        setEditingBuildId(null);
                      }}
                    >
                      <strong>{party.name || "名前なし"}</strong>
                      <span>{party.members.length} / 6匹</span>
                    </button>
                  ))}
                </aside>

                {selectedParty && (
                  <div className="content-card party-editor">
                    <div className="inline-heading">
                      <input
                        className="title-input"
                        aria-label="パーティ名"
                        value={selectedParty.name}
                        onChange={(event: FieldChangeEvent) =>
                          updateParty(selectedParty.id, { name: event.target.value })
                        }
                      />
                      <button
                        className="danger-text-button"
                        type="button"
                        onClick={() => deleteParty(selectedParty.id)}
                      >
                        削除
                      </button>
                    </div>

                    <div className="member-grid">
                      {Array.from({ length: 6 }, (_, index) => {
                        const member = selectedParty.members[index];
                        const pokemon = member ? getPokemon(member.speciesId, pokedex) : undefined;
                        if (!member || !pokemon) {
                          return (
                            <button
                              className="member-card empty"
                              type="button"
                              key={`empty-${index}`}
                              onClick={() => {
                                setTargetPartyId(selectedParty.id);
                                setView("pokedex");
                              }}
                            >
                              <span>＋</span>
                              <small>ポケモンを追加</small>
                            </button>
                          );
                        }
                        return (
                          <button
                            className={editingBuildId === member.id ? "member-card selected" : "member-card"}
                            type="button"
                            key={member.id}
                            onClick={() => setEditingBuildId(member.id)}
                          >
                            <span className="dex-number">No.{String(pokemon.number).padStart(4, "0")}</span>
                            <strong>{pokemon.name}</strong>
                            <span className="compact-types">{pokemon.types.join(" / ")}</span>
                          </button>
                        );
                      })}
                    </div>

                    {editingBuild && (
                      <BuildEditor
                        build={editingBuild}
                        pokedex={pokedex}
                        onChange={updateBuild}
                        onDelete={deleteBuild}
                      />
                    )}

                    <div className="notes-grid">
                      <label>
                        構築コンセプト
                        <textarea
                          value={selectedParty.concept}
                          onChange={(event: FieldChangeEvent) =>
                            updateParty(selectedParty.id, { concept: event.target.value })
                          }
                          placeholder="このパーティで目指す戦い方"
                        />
                      </label>
                      <label>
                        基本選出・選出メモ
                        <textarea
                          value={selectedParty.selectionNotes}
                          onChange={(event: FieldChangeEvent) =>
                            updateParty(selectedParty.id, { selectionNotes: event.target.value })
                          }
                          placeholder="よく使う選出や並び"
                        />
                      </label>
                      <label>
                        苦手な相手
                        <textarea
                          value={selectedParty.difficultMatchups}
                          onChange={(event: FieldChangeEvent) =>
                            updateParty(selectedParty.id, { difficultMatchups: event.target.value })
                          }
                          placeholder="対策したいポケモンや構築"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {view === "pokedex" && (
          <section>
            <div className="page-heading">
              <div>
                <p className="eyebrow">POKÉDEX</p>
                <h1>ポケモン図鑑</h1>
              </div>
              <p className={`pokedex-status ${pokedexStatus}`} role="status">
                {pokedexStatus === "loading" && `全国図鑑を読み込み中… 現在${pokedex.length}匹`}
                {pokedexStatus === "ready" && `全国図鑑 ${pokedex.length}匹`}
                {pokedexStatus === "fallback" && `ローカル図鑑 ${pokedex.length}匹`}
              </p>
            </div>

            <div className="pokedex-toolbar">
              <input
                value={search}
                onChange={(event: FieldChangeEvent) => setSearch(event.target.value)}
                placeholder="名前・英語名・図鑑番号で検索"
                aria-label="ポケモン検索"
              />
              <select
                value={targetPartyId}
                onChange={(event: FieldChangeEvent) => setTargetPartyId(event.target.value)}
                aria-label="追加先パーティ"
              >
                {state.parties.length === 0 && <option value="">追加先のパーティがありません</option>}
                {state.parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    追加先：{party.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pokedex-layout">
              <div className="pokedex-list">
                {filteredPokemon.map((pokemon) => (
                  <button
                    className={selectedPokemon.id === pokemon.id ? "pokedex-row active" : "pokedex-row"}
                    type="button"
                    key={pokemon.id}
                    onClick={() => setSelectedPokemonId(pokemon.id)}
                  >
                    <span>No.{String(pokemon.number).padStart(4, "0")}</span>
                    <strong>{pokemon.name}</strong>
                    <small>{pokemon.types.join(" / ")}</small>
                  </button>
                ))}
                {filteredPokemon.length === 0 && (
                  <p className="muted-message">一致するポケモンが見つかりません。</p>
                )}
              </div>

              <article className="content-card pokedex-detail">
                <span className="dex-number">No.{String(selectedPokemon.number).padStart(4, "0")}</span>
                <h2>{selectedPokemon.name}</h2>
                <p className="english-name">{selectedPokemon.englishName}</p>
                <div className="badge-row">
                  {selectedPokemon.types.map((type) => (
                    <TypeBadge type={type} key={type} />
                  ))}
                </div>

                <div className="detail-section">
                  <h3>種族値</h3>
                  <StatTable stats={selectedPokemon.stats} />
                </div>

                <div className="detail-section">
                  <h3>タイプ相性</h3>
                  <MatchupList types={selectedPokemon.types} />
                </div>

                <div className="detail-section">
                  <h3>特性</h3>
                  <p>{selectedPokemon.abilities.join(" / ") || "データなし"}</p>
                </div>

                <button
                  className="primary-button full-width"
                  type="button"
                  onClick={() => addPokemonToParty(selectedPokemon)}
                  disabled={!targetPartyId}
                >
                  選択中のパーティに追加
                </button>
                <p className={pokedexStatus === "fallback" ? "helper-text error-text" : "helper-text"}>
                  {pokedexStatus === "fallback"
                    ? `全国図鑑を取得できなかったため、ローカルデータを表示しています。${pokedexError ? ` ${pokedexError}` : ""}`
                    : "全国図鑑データはPokéAPIから取得し、このブラウザにキャッシュされます。"}
                </p>
              </article>
            </div>
          </section>
        )}

        {view === "history" && (
          <section>
            <div className="page-heading">
              <div>
                <p className="eyebrow">BATTLE HISTORY</p>
                <h1>対戦履歴</h1>
              </div>
            </div>

            <div className="history-layout">
              <form
                className="content-card log-form"
                onSubmit={saveBattleLog}
                key={editingLog?.id ?? "new-log"}
              >
                <h2>{editingLog ? "対戦記録を編集" : "対戦を記録"}</h2>
                <label>
                  対戦日
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={editingLog?.date ?? new Date().toISOString().slice(0, 10)}
                  />
                </label>
                <label>
                  勝敗
                  <select name="result" defaultValue={editingLog?.result ?? "勝ち"}>
                    <option>勝ち</option>
                    <option>負け</option>
                  </select>
                </label>
                <label>
                  使用パーティ
                  <select
                    name="partyId"
                    required
                    defaultValue={editingLog?.partyId ?? state.parties[0]?.id ?? ""}
                  >
                    <option value="" disabled>
                      パーティを選択
                    </option>
                    {state.parties.map((party) => (
                      <option value={party.id} key={party.id}>
                        {party.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  自分の選出
                  <input
                    name="ownSelection"
                    defaultValue={editingLog?.ownSelection ?? ""}
                    placeholder="例：ガブリアス、サーフゴー、カイリュー"
                  />
                </label>
                <label>
                  相手のポケモン
                  <textarea
                    name="opponentTeam"
                    defaultValue={editingLog?.opponentTeam ?? ""}
                    placeholder="見えた6匹や相手の選出"
                  />
                </label>
                <label>
                  振り返り
                  <textarea
                    name="memo"
                    defaultValue={editingLog?.memo ?? ""}
                    placeholder="良かった点、ミス、次に試したいこと"
                  />
                </label>
                <div className="form-actions">
                  <button className="primary-button" type="submit" disabled={state.parties.length === 0}>
                    {editingLog ? "更新" : "記録する"}
                  </button>
                  {editingLog && (
                    <button className="secondary-button" type="button" onClick={() => setEditingLogId(null)}>
                      キャンセル
                    </button>
                  )}
                </div>
              </form>

              <div className="log-list">
                {state.battleLogs.length === 0 ? (
                  <div className="empty-state compact">
                    <h2>まだ対戦履歴がありません</h2>
                    <p>対戦後に短いメモを残すと、構築の改善に役立ちます。</p>
                  </div>
                ) : (
                  state.battleLogs.map((log) => {
                    const party = state.parties.find((item) => item.id === log.partyId);
                    return (
                      <article className="content-card log-card" key={log.id}>
                        <div className="inline-heading">
                          <div>
                            <span className={log.result === "勝ち" ? "result win" : "result loss"}>
                              {log.result}
                            </span>
                            <strong>{log.date}</strong>
                          </div>
                          <div className="row-actions">
                            <button type="button" className="text-button" onClick={() => setEditingLogId(log.id)}>
                              編集
                            </button>
                            <button
                              type="button"
                              className="danger-text-button"
                              onClick={() =>
                                setState((current) => ({
                                  ...current,
                                  battleLogs: current.battleLogs.filter((item) => item.id !== log.id),
                                }))
                              }
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        <dl className="log-details">
                          <div>
                            <dt>パーティ</dt>
                            <dd>{party?.name ?? "削除済み"}</dd>
                          </div>
                          <div>
                            <dt>自分の選出</dt>
                            <dd>{log.ownSelection || "—"}</dd>
                          </div>
                          <div>
                            <dt>相手</dt>
                            <dd>{log.opponentTeam || "—"}</dd>
                          </div>
                          <div>
                            <dt>振り返り</dt>
                            <dd>{log.memo || "—"}</dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>パーティと対戦履歴はこのブラウザに自動保存されます。</footer>
    </div>
  );
}

export default App;
