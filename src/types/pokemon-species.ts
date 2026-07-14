import type { BaseEntity } from "./base";
import type { GameId } from "./ids";
import type { PokemonType } from "./type-chart";

export type BaseStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type PokemonSpecies = BaseEntity & {
  nationalDexNumber?: number;
  name: string;
  formName?: string;
  types: PokemonType[];
  baseStats?: BaseStats;
  abilities?: string[];
  hiddenAbility?: string;
  availableGameIds?: GameId[];
  notes?: string;
};
