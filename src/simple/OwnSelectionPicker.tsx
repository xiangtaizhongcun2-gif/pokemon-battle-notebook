import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, PokemonEntry } from "./model";
import { usePokedex } from "./pokedex";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  getPokemon,
  readStoredState,
} from "./storage";

const MAX_SELECTION_SIZE = 6;

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function splitSelection(value: string): string[] {
  return value
    .split(/[、,，\n/／;；]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function matchesPokemon(token: string, pokemon: PokemonEntry): boolean {
  const normalized = normalize(token).replace(/\s*[（(【\[].*$/, "").trim();
  return normalized === normalize(pokemon.name) || normalized === normalize(pokemon.englishName);
}

function writeInputValue(input: HTMLInputElement, tokens: string[]): void {
  input.value = tokens.join("、");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function OwnSelectionPicker() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [selectionInput, setSelectionInput] = useState<HTMLInputElement | null>(null);
  const [partySelect, setPartySelect] = useState<HTMLSelectElement | null>(null);
  const [partyId, setPartyId] = useState("");
  const [selectionText, setSelectionText] = useState("");
  const { pokedex } = usePokedex();

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const detail = (event as CustomEvent<AppState>).detail;
      setAppState(detail ?? readStoredState());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === APP_STATE_STORAGE_KEY) setAppState(readStoredState());
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
    let currentInput: HTMLInputElement | null = null;
    let currentPartySelect: HTMLSelectElement | null = null;

    const detach = () => {
      host?.remove();
      host = null;
      currentInput = null;
      currentPartySelect = null;
      setPortalTarget(null);
      setSelectionInput(null);
      setPartySelect(null);
    };

    const attachToBattleForm = () => {
      const nextInput = document.querySelector<HTMLInputElement>('input[name="ownSelection"]');
      const nextPartySelect = document.querySelector<HTMLSelectElement>('select[name="partyId"]');

      if (!nextInput || !nextPartySelect) {
        if (currentInput || currentPartySelect) detach();
        return;
      }

      if (
        nextInput === currentInput &&
        nextPartySelect === currentPartySelect &&
        host?.isConnected
      ) {
        return;
      }

      detach();
      const parent = nextInput.parentElement;
      if (!parent) return;

      host = document.createElement("div");
      host.className = "own-selection-picker-host";
      parent.insertBefore(host, nextInput);
      currentInput = nextInput;
      currentPartySelect = nextPartySelect;
      setSelectionInput(nextInput);
      setPartySelect(nextPartySelect);
      setPortalTarget(host);
      setPartyId(nextPartySelect.value);
      setSelectionText(nextInput.value);
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
    if (!selectionInput) return;
    const syncSelection = () => setSelectionText(selectionInput.value);
    syncSelection();
    selectionInput.addEventListener("input", syncSelection);
    selectionInput.addEventListener("change", syncSelection);
    return () => {
      selectionInput.removeEventListener("input", syncSelection);
      selectionInput.removeEventListener("change", syncSelection);
    };
  }, [selectionInput]);

  useEffect(() => {
    if (!partySelect || !selectionInput) return;

    const syncParty = () => {
      const nextPartyId = partySelect.value;
      setPartyId((currentPartyId) => {
        if (currentPartyId && currentPartyId !== nextPartyId) {
          writeInputValue(selectionInput, []);
          setSelectionText("");
        }
        return nextPartyId;
      });
    };

    syncParty();
    partySelect.addEventListener("change", syncParty);
    return () => partySelect.removeEventListener("change", syncParty);
  }, [partySelect, selectionInput]);

  const party = appState.parties.find((entry) => entry.id === partyId);
  const members = useMemo(
    () =>
      (party?.members ?? [])
        .map((build) => {
          const pokemon = getPokemon(build.speciesId, pokedex);
          return pokemon ? { build, pokemon } : undefined;
        })
        .filter(
          (entry): entry is { build: NonNullable<typeof entry>["build"]; pokemon: PokemonEntry } =>
            Boolean(entry),
        ),
    [party?.members, pokedex],
  );

  const tokens = useMemo(() => splitSelection(selectionText), [selectionText]);
  const selectedIds = useMemo(
    () =>
      new Set(
        members
          .filter(({ pokemon }) => tokens.some((token) => matchesPokemon(token, pokemon)))
          .map(({ build }) => build.id),
      ),
    [members, tokens],
  );

  const togglePokemon = (pokemon: PokemonEntry, buildId: string) => {
    if (!selectionInput) return;

    const currentTokens = splitSelection(selectionInput.value);
    const isSelected = selectedIds.has(buildId);
    const nextTokens = isSelected
      ? currentTokens.filter((token) => !matchesPokemon(token, pokemon))
      : [...currentTokens, pokemon.name];

    if (!isSelected && selectedIds.size >= MAX_SELECTION_SIZE) return;
    writeInputValue(selectionInput, nextTokens);
    setSelectionText(selectionInput.value);
  };

  if (!portalTarget || !selectionInput) return null;

  return createPortal(
    <section className="own-selection-picker" aria-labelledby="own-selection-picker-title">
      <div className="own-selection-heading">
        <div>
          <strong id="own-selection-picker-title">パーティから選出を選ぶ</strong>
          <small>クリックすると下の入力欄へ追加されます</small>
        </div>
        <span>{selectedIds.size} / {Math.min(MAX_SELECTION_SIZE, members.length)}匹</span>
      </div>

      {members.length > 0 ? (
        <div className="own-selection-members" aria-label="自分の選出候補">
          {members.map(({ build, pokemon }) => {
            const selected = selectedIds.has(build.id);
            return (
              <button
                className={selected ? "own-selection-member selected" : "own-selection-member"}
                type="button"
                key={build.id}
                aria-pressed={selected}
                onClick={() => togglePokemon(pokemon, build.id)}
              >
                <small>No.{String(pokemon.number).padStart(4, "0")}</small>
                <strong>{pokemon.name}</strong>
                <span>{selected ? "選出中" : "追加"}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="own-selection-empty">
          使用パーティにポケモンを登録すると、ここから選出できます。
        </p>
      )}

      <p className="own-selection-helper">
        作品やルールに合わせて最大6匹まで選べます。下の欄への手入力も引き続き使えます。
      </p>
    </section>,
    portalTarget,
  );
}
