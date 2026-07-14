export type StatStage = -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DamageCalculationInput = {
  level: number;
  power: number;
  attack: number;
  defense: number;
  attackStage: StatStage;
  defenseStage: StatStage;
  stab: number;
  typeEffectiveness: number;
  weather: number;
  critical: boolean;
  burn: boolean;
  screen: number;
  spread: boolean;
  other: number;
};

export type DamageCalculationResult = {
  rolls: number[];
  minimum: number;
  maximum: number;
  effectiveAttack: number;
  effectiveDefense: number;
  baseDamage: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function applyStatStage(stat: number, stage: number): number {
  const safeStat = Math.max(1, Math.trunc(stat));
  const safeStage = clamp(Math.trunc(stage), -6, 6);
  if (safeStage >= 0) return Math.max(1, Math.floor((safeStat * (2 + safeStage)) / 2));
  return Math.max(1, Math.floor((safeStat * 2) / (2 - safeStage)));
}

export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
  const level = clamp(Math.trunc(input.level), 1, 100);
  const power = Math.max(0, Math.trunc(input.power));
  const effectiveAttack = applyStatStage(input.attack, input.attackStage);
  const effectiveDefense = applyStatStage(input.defense, input.defenseStage);

  if (power === 0 || input.typeEffectiveness === 0) {
    return {
      rolls: Array.from({ length: 16 }, () => 0),
      minimum: 0,
      maximum: 0,
      effectiveAttack,
      effectiveDefense,
      baseDamage: 0,
    };
  }

  const levelFactor = Math.floor((2 * level) / 5) + 2;
  const baseDamage = Math.floor(Math.floor((levelFactor * power * effectiveAttack) / effectiveDefense) / 50) + 2;
  const fixedModifier =
    Math.max(0, input.weather) *
    (input.critical ? 1.5 : 1) *
    Math.max(0, input.stab) *
    Math.max(0, input.typeEffectiveness) *
    (input.burn ? 0.5 : 1) *
    Math.max(0, input.screen) *
    (input.spread ? 0.75 : 1) *
    Math.max(0, input.other);

  const rolls = Array.from({ length: 16 }, (_, index) => {
    const random = 85 + index;
    return Math.max(1, Math.floor((baseDamage * fixedModifier * random) / 100));
  });

  return {
    rolls,
    minimum: rolls[0],
    maximum: rolls[rolls.length - 1],
    effectiveAttack,
    effectiveDefense,
    baseDamage,
  };
}

export function formatKoRange(hp: number, minimum: number, maximum: number): string {
  const safeHp = Math.max(1, Math.trunc(hp));
  if (maximum <= 0) return "ダメージなし";
  const possible = Math.max(1, Math.ceil(safeHp / maximum));
  const guaranteed = minimum > 0 ? Math.max(1, Math.ceil(safeHp / minimum)) : Infinity;
  if (possible === guaranteed) return `確定${possible}発`;
  return `乱数${possible}〜${Number.isFinite(guaranteed) ? guaranteed : "∞"}発`;
}

export function oneHitProbability(hp: number, rolls: number[]): number {
  if (rolls.length === 0) return 0;
  const wins = rolls.filter((damage) => damage >= hp).length;
  return (wins / rolls.length) * 100;
}
