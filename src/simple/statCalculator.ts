import type { PokemonBuild, PokemonEntry, Stats } from "./model";

export const DEFAULT_LEVEL = 50;
export const DEFAULT_IVS: Stats = {
  hp: 31,
  attack: 31,
  defense: 31,
  specialAttack: 31,
  specialDefense: 31,
  speed: 31,
};

export const STAT_FIELDS: Array<{ key: keyof Stats; label: string; name: string }> = [
  { key: "hp", label: "H", name: "HP" },
  { key: "attack", label: "A", name: "攻撃" },
  { key: "defense", label: "B", name: "防御" },
  { key: "specialAttack", label: "C", name: "特攻" },
  { key: "specialDefense", label: "D", name: "特防" },
  { key: "speed", label: "S", name: "素早さ" },
];

type NatureAffectedStat = Exclude<keyof Stats, "hp">;
type NatureEffect = {
  increased?: NatureAffectedStat;
  decreased?: NatureAffectedStat;
};

const NATURE_EFFECTS: Record<string, NatureEffect> = {
  いじっぱり: { increased: "attack", decreased: "specialAttack" },
  ひかえめ: { increased: "specialAttack", decreased: "attack" },
  ようき: { increased: "speed", decreased: "specialAttack" },
  おくびょう: { increased: "speed", decreased: "attack" },
  わんぱく: { increased: "defense", decreased: "specialAttack" },
  ずぶとい: { increased: "defense", decreased: "attack" },
  しんちょう: { increased: "specialDefense", decreased: "specialAttack" },
  おだやか: { increased: "specialDefense", decreased: "attack" },
  ゆうかん: { increased: "attack", decreased: "speed" },
  れいせい: { increased: "specialAttack", decreased: "speed" },
  まじめ: {},
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function getNatureMultiplier(nature: string, stat: keyof Stats): number {
  if (stat === "hp") return 1;
  const effect = NATURE_EFFECTS[nature];
  if (effect?.increased === stat) return 1.1;
  if (effect?.decreased === stat) return 0.9;
  return 1;
}

function calculateTraditionalStat({
  baseStat,
  iv,
  ev,
  level,
  natureMultiplier,
  isHp,
}: {
  baseStat: number;
  iv: number;
  ev: number;
  level: number;
  natureMultiplier: number;
  isHp: boolean;
}): number {
  if (isHp && baseStat === 1) return 1;

  const scaledValue = Math.floor(
    ((2 * baseStat + clamp(iv, 0, 31) + Math.floor(Math.max(0, ev) / 4)) * level) / 100,
  );

  if (isHp) return scaledValue + level + 10;
  return Math.floor((scaledValue + 5) * natureMultiplier);
}

export function calculateActualStats(pokemon: PokemonEntry, build: PokemonBuild): Stats {
  const trainingSystem = build.trainingSystem ?? "traditional";
  const level = clamp(build.level ?? DEFAULT_LEVEL, 1, 100);
  const ivs = build.ivs ?? DEFAULT_IVS;

  return Object.fromEntries(
    STAT_FIELDS.map(({ key }) => {
      const natureMultiplier = getNatureMultiplier(build.nature, key);
      const isHp = key === "hp";

      if (trainingSystem === "champions") {
        const level50BaseStat = calculateTraditionalStat({
          baseStat: pokemon.stats[key],
          iv: 31,
          ev: 0,
          level: 50,
          natureMultiplier,
          isHp,
        });
        const effortPointBonus = pokemon.stats.hp === 1 && isHp ? 0 : Math.max(0, build.evs[key]);
        return [key, level50BaseStat + effortPointBonus];
      }

      return [
        key,
        calculateTraditionalStat({
          baseStat: pokemon.stats[key],
          iv: ivs[key],
          ev: build.evs[key],
          level,
          natureMultiplier,
          isHp,
        }),
      ];
    }),
  ) as Stats;
}
