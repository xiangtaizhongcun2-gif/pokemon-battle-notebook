import type { BaseEntity } from "./base";
import type { GameId } from "./ids";

export type PokemonType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Electric"
  | "Grass"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Dark"
  | "Steel"
  | "Fairy"
  | "Stellar"
  | "Custom";

export type TypeEffectiveness = {
  type: PokemonType;
  multiplier: number;
};

export type TypeChartEntry = {
  attackType: PokemonType;
  defenseType: PokemonType;
  multiplier: number;
};

export type TypeChart = BaseEntity & {
  name: string;
  gameIds?: GameId[];
  generation?: number;
  matchups: TypeChartEntry[];
};
