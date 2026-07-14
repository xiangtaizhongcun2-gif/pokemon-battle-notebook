import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { POKEDEX } from "./data";
import type { AppState, PokemonEntry, Stats } from "./model";

const STORAGE_KEY = "pokemon-battle-notebook.simple.v1";

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

export function useStoredState(): [AppState, Dispatch<SetStateAction<AppState>>] {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AppState) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState];
}
