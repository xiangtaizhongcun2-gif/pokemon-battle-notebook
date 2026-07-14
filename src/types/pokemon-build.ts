import type { BaseEntity } from "./base";
import type { PokemonSpeciesId, TagId } from "./ids";
import type { PokemonType } from "./type-chart";

export type MoveSlot = {
  name: string;
  type?: PokemonType;
  category?: "Physical" | "Special" | "Status" | "Unknown";
  notes?: string;
};

export type StatSpread = {
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
};

export type PokemonBuild = BaseEntity & {
  speciesId: PokemonSpeciesId;
  nickname?: string;
  formName?: string;
  level?: number;
  gender?: "Male" | "Female" | "Genderless" | "Unknown";
  nature?: string;
  ability?: string;
  item?: string;
  typesOverride?: PokemonType[];
  teraType?: PokemonType;
  moves: MoveSlot[];
  evs?: StatSpread;
  ivs?: StatSpread;
  actualStats?: StatSpread;
  roleTagIds: TagId[];
  memo?: string;
};
