import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { POKEDEX } from "./data";
import type { AppState, PokemonEntry, Stats } from "./model";

export const APP_STATE_STORAGE_KEY = "pokemon-battle-notebook.simple.v1";
export const APP_STATE_CHANGED_EVENT = "pokemon-battle-notebook:state-changed";

export const emptyStats = (): Stats => ({
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
});

const initialState: AppState = {
  parties: [
    {
      id: "starter-party",
      name: "マイパーティ",
      concept: "",
      selectionNotes: "",
      difficultMatchups: "",
      members: [],
    },
  ],
  battleLogs: [],
};

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPokemon(
  speciesId: string,
  pokedex: PokemonEntry[] = POKEDEX,
): PokemonEntry | undefined {
  return pokedex.find((pokemon) => pokemon.id === speciesId);
}

export function readStoredState(): AppState {
  try {
    const saved = localStorage.getItem(APP_STATE_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as AppState) : initialState;
  } catch {
    return initialState;
  }
}

export function useStoredState(): [AppState, Dispatch<SetStateAction<AppState>>] {
  const [state, setState] = useState<AppState>(() => readStoredState());

  useEffect(() => {
    localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent<AppState>(APP_STATE_CHANGED_EVENT, {
        detail: state,
      }),
    );
  }, [state]);

  return [state, setState];
}
