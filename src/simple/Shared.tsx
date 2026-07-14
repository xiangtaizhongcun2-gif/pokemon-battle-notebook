import { calculateMatchups, formatMultiplier } from "./matchups";
import type { PokemonType, Stats } from "./model";

export function TypeBadge({ type }: { type: PokemonType }) {
  return <span className="type-badge">{type}</span>;
}

export function MatchupList({ types }: { types: PokemonType[] }) {
  const matchups = calculateMatchups(types);

  return (
    <div className="matchup-list">
      {matchups.map((matchup) => (
        <div className="matchup-row" key={matchup.multiplier}>
          <span className="matchup-label">{formatMultiplier(matchup.multiplier)}</span>
          <div className="badge-row">
            {matchup.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatTable({ stats }: { stats: Stats }) {
  const rows = [
    ["H", stats.hp],
    ["A", stats.attack],
    ["B", stats.defense],
    ["C", stats.specialAttack],
    ["D", stats.specialDefense],
    ["S", stats.speed],
  ] as const;

  return (
    <div className="stat-grid">
      {rows.map(([label, value]) => (
        <div className="stat-cell" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
