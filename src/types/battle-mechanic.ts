import type { BattleMechanicId } from "./ids";

export type BattleMechanicType =
  | "MegaEvolution"
  | "ZMove"
  | "Dynamax"
  | "Gigantamax"
  | "Terastal"
  | "UltraBurst"
  | "Custom";

export type BattleMechanicDetail = {
  key: string;
  label: string;
  value: string;
};

export type BattleMechanic = {
  id: BattleMechanicId;
  type: BattleMechanicType;
  name: string;
  details: BattleMechanicDetail[];
  notes?: string;
};
