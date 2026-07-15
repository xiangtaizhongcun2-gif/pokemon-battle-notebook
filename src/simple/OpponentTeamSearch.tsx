import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent, PointerEvent } from "react";
import type { PokemonEntry } from "./model";
import { usePokedex } from "./pokedex";

const MAX_OPPONENT_POKEMON = 6;
const MAX_SEARCH_RESULTS = 20;

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase();
}

function splitTeamText(value: string): string[] {
  return value
    .split(/[、,，\n/／]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function matchesToken(pokemon: PokemonEntry, token: string): boolean {
  const normalized = normalize(token);
  return normalize(pokemon.name) === normalized || normalize(pokemon.englishName) === normalized;
}

function getSelectedPokemon(value: string, pokedex: PokemonEntry[]): PokemonEntry[] {
  const selected = new Map<string, PokemonEntry>();

  splitTeamText(value).forEach((token) => {
    const pokemon = pokedex.find((entry) => matchesToken(entry, token));
    if (pokemon) selected.set(pokemon.id, pokemon);
  });

  return [...selected.values()].slice(0, MAX_OPPONENT_POKEMON);
}

function writeTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

  if (setter) setter.call(textarea, value);
  else textarea.value = value;

  const inputEvent = typeof InputEvent === "function"
    ? new InputEvent("input", { bubbles: true, inputType: "insertText", data: null })
    : new Event("input", { bubbles: true });

  textarea.dispatchEvent(inputEvent);
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

export function OpponentTeamSearch() {
  const { pokedex, status } = usePokedex();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);
  const [teamText, setTeamText] = useState("");
  const [search, setSearch] = useState("");
  const teamTextRef = useRef("");

  useEffect(() => {
    teamTextRef.current = teamText;
  }, [teamText]);

  useEffect(() => {
    let host: HTMLDivElement | null = null;
    let currentTextarea: HTMLTextAreaElement | null = null;

    const detach = () => {
      currentTextarea?.classList.remove("opponent-team-textarea");
      host?.remove();
      host = null;
      currentTextarea = null;
      setPortalTarget(null);
      setTextarea(null);
    };

    const attachToBattleForm = () => {
      const nextTextarea = document.querySelector<HTMLTextAreaElement>('textarea[name="opponentTeam"]');

      if (!nextTextarea) {
        if (currentTextarea) detach();
        return;
      }

      if (nextTextarea === currentTextarea && host?.isConnected) return;

      detach();
      const parent = nextTextarea.parentElement;
      if (!parent) return;

      host = document.createElement("div");
      host.className = "opponent-team-search-host";
      parent.insertBefore(host, nextTextarea);
      nextTextarea.classList.add("opponent-team-textarea");
      nextTextarea.placeholder = "相手の選出や補足メモ。手入力もできます。";
      currentTextarea = nextTextarea;
      setTextarea(nextTextarea);
      setPortalTarget(host);
      setTeamText(nextTextarea.value);
      teamTextRef.current = nextTextarea.value;
      setSearch("");
    };

    attachToBattleForm();
    const observer = new MutationObserver(attachToBattleForm);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      detach();
    };
  }, []);

  useEffect(() => {
    if (!textarea) return;

    const syncFromTextarea = () => {
      teamTextRef.current = textarea.value;
      setTeamText(textarea.value);
    };
    syncFromTextarea();
    textarea.addEventListener("input", syncFromTextarea);
    textarea.addEventListener("change", syncFromTextarea);

    return () => {
      textarea.removeEventListener("input", syncFromTextarea);
      textarea.removeEventListener("change", syncFromTextarea);
    };
  }, [textarea]);

  useEffect(() => {
    if (!textarea) return;
    const form = textarea.closest("form");
    if (!form) return;

    const flushValue = () => {
      const value = teamTextRef.current;
      if (textarea.value !== value) writeTextareaValue(textarea, value);
      else {
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
        if (setter) {
          setter.call(textarea, `${value} `);
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          setter.call(textarea, value);
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    };

    const handlePointerDown = (event: Event) => {
      const target = event.target instanceof Element ? event.target.closest("button, input") : null;
      if (!target || !form.contains(target)) return;

      const isSubmitControl =
        (target instanceof HTMLButtonElement && (target.type === "submit" || /保存|記録/.test(target.textContent ?? ""))) ||
        (target instanceof HTMLInputElement && target.type === "submit");

      if (isSubmitControl) flushValue();
    };

    const handleSubmit = () => flushValue();
    form.addEventListener("pointerdown", handlePointerDown, true);
    form.addEventListener("touchstart", handlePointerDown, true);
    form.addEventListener("submit", handleSubmit, true);

    return () => {
      form.removeEventListener("pointerdown", handlePointerDown, true);
      form.removeEventListener("touchstart", handlePointerDown, true);
      form.removeEventListener("submit", handleSubmit, true);
    };
  }, [textarea]);

  const selectedPokemon = useMemo(() => getSelectedPokemon(teamText, pokedex), [pokedex, teamText]);
  const selectedIds = useMemo(() => new Set(selectedPokemon.map((pokemon) => pokemon.id)), [selectedPokemon]);

  const searchResults = useMemo(() => {
    const query = normalize(search);
    if (!query) return [];

    return pokedex
      .filter((pokemon) => {
        if (selectedIds.has(pokemon.id)) return false;
        return normalize(`${pokemon.name} ${pokemon.englishName} ${pokemon.number}`).includes(query);
      })
      .slice(0, MAX_SEARCH_RESULTS);
  }, [pokedex, search, selectedIds]);

  const updateTeam = (tokens: string[]) => {
    if (!textarea) return;
    const value = tokens.join("、");
    teamTextRef.current = value;
    writeTextareaValue(textarea, value);
    setTeamText(value);
  };

  const addPokemon = (pokemon: PokemonEntry) => {
    if (selectedPokemon.length >= MAX_OPPONENT_POKEMON) return;

    const tokens = splitTeamText(teamTextRef.current);
    if (tokens.some((token) => matchesToken(pokemon, token))) return;

    updateTeam([...tokens, pokemon.name]);
    setSearch("");
  };

  const removePokemon = (pokemon: PokemonEntry) => {
    const tokens = splitTeamText(teamTextRef.current).filter((token) => !matchesToken(pokemon, token));
    updateTeam(tokens);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || searchResults.length === 0) return;
    event.preventDefault();
    addPokemon(searchResults[0]);
  };

  const handleCandidatePointerDown = (event: PointerEvent<HTMLButtonElement>, pokemon: PokemonEntry) => {
    event.preventDefault();
    event.stopPropagation();
    addPokemon(pokemon);
  };

  if (!portalTarget || !textarea) return null;

  const atLimit = selectedPokemon.length >= MAX_OPPONENT_POKEMON;

  return createPortal(
    <section className="opponent-team-search" aria-labelledby="opponent-team-search-title">
      <div className="opponent-team-heading">
        <div>
          <strong id="opponent-team-search-title">相手パーティを検索</strong>
          <small>名前・英語名・図鑑番号に対応</small>
        </div>
        <span>{selectedPokemon.length} / {MAX_OPPONENT_POKEMON}匹</span>
      </div>

      {selectedPokemon.length > 0 && (
        <div className="opponent-team-selected" aria-label="登録した相手のポケモン">
          {selectedPokemon.map((pokemon) => (
            <div className="opponent-team-chip" key={pokemon.id}>
              <span>
                <small>No.{String(pokemon.number).padStart(4, "0")}</small>
                <strong>{pokemon.name}</strong>
              </span>
              <button
                type="button"
                aria-label={`${pokemon.name}を相手パーティから外す`}
                onClick={() => removePokemon(pokemon)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="opponent-team-search-box">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={atLimit ? "6匹登録済みです" : "例：ガブリアス、Garchomp、445"}
          aria-label="相手パーティのポケモンを検索"
          disabled={atLimit}
          autoComplete="off"
        />

        {search && !atLimit && (
          <div className="opponent-team-results" role="listbox" aria-label="ポケモン検索結果">
            {searchResults.map((pokemon) => (
              <button
                type="button"
                role="option"
                aria-selected="false"
                key={pokemon.id}
                onPointerDown={(event) => handleCandidatePointerDown(event, pokemon)}
                onClick={() => addPokemon(pokemon)}
              >
                <span className="opponent-result-number">No.{String(pokemon.number).padStart(4, "0")}</span>
                <span>
                  <strong>{pokemon.name}</strong>
                  <small>{pokemon.englishName}</small>
                </span>
                <small>{pokemon.types.join(" / ")}</small>
              </button>
            ))}
            {searchResults.length === 0 && (
              <p>{status === "loading" ? "図鑑データを読み込み中です。" : "一致するポケモンが見つかりません。"}</p>
            )}
          </div>
        )}
      </div>

      <p className="opponent-team-helper">
        候補をクリックすると下の欄へ追加されます。補足内容は下の欄へ直接入力できます。
      </p>
    </section>,
    portalTarget,
  );
}
