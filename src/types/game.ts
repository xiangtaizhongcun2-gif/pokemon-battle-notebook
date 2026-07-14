import type { BaseEntity, ISODateString } from "./base";
import type { GameId, RuleSetId } from "./ids";

export type Game = BaseEntity & {
  name: string;
  shortName?: string;
  generation?: number;
  releaseOrder?: number;
  notes?: string;
  isCustom?: boolean;
};

export type RuleSet = BaseEntity & {
  name: string;
  description?: string;
  gameIds?: GameId[];
  isCustom?: boolean;
};

export type Season = BaseEntity & {
  name: string;
  gameId?: GameId;
  ruleSetId?: RuleSetId;
  regulationName?: string;
  startDate?: ISODateString;
  endDate?: ISODateString;
  notes?: string;
};
