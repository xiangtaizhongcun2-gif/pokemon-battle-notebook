import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, PokemonBuild, PokemonEntry } from "./model";
import { usePokedex } from "./pokedex";
import { useBuildSuggestions } from "./suggestions";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  readStoredState,
} from "./storage";

type CandidateMode = "registered" | "learnable";

type DamageMoveContext = {
  sourceKey: string;
  pokemonSearch: string;
  currentMove: string;
};

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function uniqueMoves(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function findPokemon(value: string, pokedex: PokemonEntry[]): PokemonEntry | undefined {
  const normalized = normalize(value);
  const visibleName = normalize(value.split("｜")[0] ?? value);

  return pokedex.find((pokemon) => {
    const number = String(pokemon.number);
    return (
      normalize(pokemon.name) === visibleName ||
      normalize(pokemon.englishName) === visibleName ||
      normalized === number ||
      normalized === `no.${number}` ||
      normalized.includes(`no.${String(pokemon.number).padStart(4, "0")}`)
    );
  });
}

function findBuildFromSource(sourceKey: string, state: AppState): PokemonBuild | null {
  if (sourceKey.startsWith("party:")) {
    const [, partyId, buildId] = sourceKey.split(":");
    return (
      state.parties
        .find((party) => party.id === partyId)
        ?.members.find((member) => member.id === buildId) ?? null
    );
  }

  if (sourceKey.startsWith("template:")) {
    const templateId = sourceKey.slice("template:".length);
    const template = (state.buildTemplates ?? []).find((entry) => entry.id === templateId);
    if (!template) return null;
    return {
      id: template.id,
      speciesId: template.speciesId,
      ability: template.ability,
      item: template.item,
      nature: template.nature,
      teraType: template.teraType,
      moves: [...template.moves] as PokemonBuild["moves"],
      evs: { ...template.evs },
      trainingSystem: template.trainingSystem,
      level: template.level,
      ivs: template.ivs ? { ...template.ivs } : undefined,
      memo: template.memo,
    };
  }

  return null;
}

function setReactInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function readDamageContext(): DamageMoveContext | null {
  const page = document.querySelector<HTMLElement>(".damage-calculator-page");
  const attackerCard = page?.querySelector<HTMLElement>(".damage-side-card");
  const sourceSelect = attackerCard?.querySelector<HTMLSelectElement>("select");
  const pokemonInput = attackerCard?.querySelector<HTMLInputElement>(".autocomplete-input input");
  const moveInput = page?.querySelector<HTMLInputElement>(
    ".damage-move-card .damage-move-grid .autocomplete-input input",
  );

  if (!page || !attackerCard || !sourceSelect || !pokemonInput || !moveInput) return null;
  return {
    sourceKey: sourceSelect.value,
    pokemonSearch: pokemonInput.value,
    currentMove: moveInput.value,
  };
}

function sameContext(left: DamageMoveContext | null, right: DamageMoveContext | null): boolean {
  return (
    left?.sourceKey === right?.sourceKey &&
    left?.pokemonSearch === right?.pokemonSearch &&
    left?.currentMove === right?.currentMove
  );
}

export function DamageMoveOptionsEnhancer() {
  const { pokedex } = usePokedex();
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [context, setContext] = useState<DamageMoveContext | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const sourceBuild = useMemo(
    () => (context ? findBuildFromSource(context.sourceKey, appState) : null),
    [appState, context],
  );
  const directPokemon = useMemo(
    () => (context ? findPokemon(context.pokemonSearch, pokedex) : undefined),
    [context, pokedex],
  );
  const speciesId = sourceBuild?.speciesId ?? directPokemon?.id ?? pokedex[0]?.id ?? "bulbasaur";
  const {
    moveOptions: learnableMoves,
    status: learnableStatus,
    statusText: learnableStatusText,
  } = useBuildSuggestions(speciesId);

  const mode: CandidateMode = sourceBuild ? "registered" : "learnable";
  const moveOptions = useMemo(
    () =>
      mode === "registered"
        ? uniqueMoves(sourceBuild?.moves ?? [])
        : uniqueMoves(learnableMoves),
    [learnableMoves, mode, sourceBuild],
  );

  useEffect(() => {
    let host: HTMLDivElement | null = null;

    const refresh = () => {
      const moveCard = document.querySelector<HTMLElement>(
        ".damage-calculator-page .damage-move-card",
      );
      const moveGrid = moveCard?.querySelector<HTMLElement>(".damage-move-grid");

      if (!moveCard || !moveGrid) {
        host?.remove();
        host = null;
        setPortalTarget(null);
        setContext(null);
        return;
      }

      if (!host || !host.isConnected) {
        host = document.createElement("div");
        host.className = "damage-move-options-host";
        moveGrid.insertAdjacentElement("beforebegin", host);
        setPortalTarget(host);
      }

      const nextContext = readDamageContext();
      setContext((current) => (sameContext(current, nextContext) ? current : nextContext));
    };

    const scheduleRefresh = () => window.setTimeout(refresh, 0);
    refresh();

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("input", scheduleRefresh, true);
    document.addEventListener("change", scheduleRefresh, true);
    document.addEventListener("click", scheduleRefresh, true);
    const interval = window.setInterval(refresh, 400);

    return () => {
      observer.disconnect();
      document.removeEventListener("input", scheduleRefresh, true);
      document.removeEventListener("change", scheduleRefresh, true);
      document.removeEventListener("click", scheduleRefresh, true);
      window.clearInterval(interval);
      host?.remove();
    };
  }, []);

  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<AppState>).detail;
      setAppState(detail ?? readStoredState());
    };
    const storage = (event: StorageEvent) => {
      if (event.key === APP_STATE_STORAGE_KEY) setAppState(readStoredState());
    };
    window.addEventListener(APP_STATE_CHANGED_EVENT, update);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, update);
      window.removeEventListener("storage", storage);
    };
  }, []);

  useEffect(() => {
    if (!portalTarget || !context) return;
    if (mode === "learnable" && learnableStatus === "loading") return;

    const input = document.querySelector<HTMLInputElement>(
      ".damage-calculator-page .damage-move-card .damage-move-grid .autocomplete-input input",
    );
    if (!input) return;

    const currentIsAvailable = moveOptions.some(
      (move) => normalize(move) === normalize(input.value),
    );
    if (currentIsAvailable) return;

    setReactInputValue(input, moveOptions[0] ?? "");
  }, [context?.sourceKey, context?.pokemonSearch, learnableStatus, mode, moveOptions, portalTarget]);

  if (!portalTarget || !context) return null;

  const sourceLabel =
    mode === "registered"
      ? context.sourceKey.startsWith("template:")
        ? "型テンプレートの登録技"
        : "パーティに登録した技"
      : "このポケモンが覚えられる全技";
  const statusText =
    mode === "registered"
      ? moveOptions.length > 0
        ? `${moveOptions.length}個の登録技から選べます。`
        : "この育成データには技が登録されていません。"
      : learnableStatusText;

  return createPortal(
    <section className="damage-move-options-panel" aria-labelledby="damage-move-options-title">
      <div className="damage-move-options-heading">
        <div>
          <p className="eyebrow">MOVE OPTIONS</p>
          <h3 id="damage-move-options-title">技候補</h3>
        </div>
        <div className="damage-move-option-tabs" aria-label="技候補の種類">
          <span className={mode === "registered" ? "active" : ""}>登録技</span>
          <span className={mode === "learnable" ? "active" : ""}>覚えられる全技</span>
        </div>
      </div>

      <label>
        {sourceLabel}
        <select
          value={moveOptions.some((move) => normalize(move) === normalize(context.currentMove)) ? context.currentMove : ""}
          disabled={moveOptions.length === 0 || (mode === "learnable" && learnableStatus === "loading")}
          onChange={(event) => {
            const input = document.querySelector<HTMLInputElement>(
              ".damage-calculator-page .damage-move-card .damage-move-grid .autocomplete-input input",
            );
            if (input) setReactInputValue(input, event.target.value);
          }}
        >
          <option value="">
            {moveOptions.length === 0 ? "選べる技がありません" : "技を選択してください"}
          </option>
          {moveOptions.map((move) => (
            <option key={move} value={move}>{move}</option>
          ))}
        </select>
      </label>

      <p className={`damage-move-options-status ${mode === "registered" || learnableStatus === "ready" ? "ready" : learnableStatus}`} role="status">
        {statusText}
      </p>
      <p className="damage-move-options-note">
        下の技名入力欄でも候補を検索できます。候補を選ぶと威力・タイプ・分類も自動更新されます。
      </p>
    </section>,
    portalTarget,
  );
}
