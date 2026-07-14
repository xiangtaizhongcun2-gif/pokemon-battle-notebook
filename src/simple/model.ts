import type { ChangeEvent } from "react";

export type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

export type View = "parties" | "pokedex" | "history";
export type TrainingSystem = "traditional" | "champions";
export type PokemonType =
  | "ノーマル"
  | "ほのお"
  | "みず"
  | "でんき"
  | "くさ"
  | "こおり"
  | "かくとう"
  | "どく"
  | "じめん"
  | "ひこう"
  | "エスパー"
  | "むし"
  | "いわ"
  | "ゴースト"
  | "ドラゴン"
  | "あく"
  | "はがね"
  | "フェアリー";

export type Stats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type PokemonEntry = {
  id: string;
  number: number;
  name: string;
  englishName: string;
  types: PokemonType[];
  abilities: string[];
  stats: Stats;
};

export type PokemonBuild = {
  id: string;
  speciesId: string;
  ability: string;
  item: string;
  nature: string;
  teraType: PokemonType;
  moves: [string, string, string, string];
  evs: Stats;
  trainingSystem?: TrainingSystem;
  memo: string;
};

export type Party = {
  id: string;
  name: string;
  concept: string;
  selectionNotes: string;
  difficultMatchups: string;
  members: PokemonBuild[];
};

export type BattleLog = {
  id: string;
  date: string;
  result: "勝ち" | "負け";
  partyId: string;
  ownSelection: string;
  opponentTeam: string;
  memo: string;
};

export type AppState = {
  parties: Party[];
  battleLogs: BattleLog[];
};

export type Matchup = {
  multiplier: number;
  types: PokemonType[];
};
