import type { BaseEntity } from "./base";
import type {
  BattleLogId,
  DamageNoteId,
  PartyId,
  PokemonSpeciesId,
  ResearchNoteId,
  TagId,
} from "./ids";

export type PokemonKnowledgePage = BaseEntity & {
  speciesId: PokemonSpeciesId;
  title: string;
  summary?: string;
  importantMemo?: string;
  personalNotes?: string;
  roleTagIds: TagId[];
  linkedPartyIds: PartyId[];
  linkedBattleLogIds: BattleLogId[];
  linkedResearchNoteIds: ResearchNoteId[];
  linkedDamageNoteIds: DamageNoteId[];
  favorite?: boolean;
};
