import { ALL_TYPES, NATURES } from "./data";
import type { FieldChangeEvent, PokemonBuild, PokemonEntry, PokemonType, Stats } from "./model";
import { MatchupList, TypeBadge } from "./Shared";
import { getPokemon } from "./storage";
import { AutocompleteInput } from "./AutocompleteInput";
import { useBuildSuggestions } from "./suggestions";
import { usePrioritizedItemOptions } from "./itemHistory";

export function BuildEditor({
  build,
  pokedex,
  onChange,
  onDelete,
}: {
  build: PokemonBuild;
  pokedex: PokemonEntry[];
  onChange: (buildId: string, patch: Partial<PokemonBuild>) => void;
  onDelete: (buildId: string) => void;
}) {
  const pokemon = getPokemon(build.speciesId, pokedex);
  const {
    moveOptions,
    itemOptions: availableItemOptions,
    status: suggestionStatus,
    statusText,
  } = useBuildSuggestions(build.speciesId);
  const { itemOptions, rememberItem } = usePrioritizedItemOptions(availableItemOptions);
  if (!pokemon) return null;

  const evTotal = Object.values(build.evs).reduce((sum, value) => sum + value, 0);
  const statFields: { key: keyof Stats; label: string }[] = [
    { key: "hp", label: "H" },
    { key: "attack", label: "A" },
    { key: "defense", label: "B" },
    { key: "specialAttack", label: "C" },
    { key: "specialDefense", label: "D" },
    { key: "speed", label: "S" },
  ];

  return (
    <div className="build-editor">
      <div className="inline-heading">
        <div>
          <p className="eyebrow">BUILD</p>
          <h2>{pokemon.name}</h2>
          <div className="badge-row">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
        <button className="danger-text-button" type="button" onClick={() => onDelete(build.id)}>
          パーティから外す
        </button>
      </div>

      <div className="form-grid">
        <label>
          特性
          <AutocompleteInput
            ariaLabel="特性"
            value={build.ability}
            options={pokemon.abilities}
            placeholder="特性名を入力"
            emptyMessage="このポケモンに登録された特性候補はありません。"
            onChange={(ability) => onChange(build.id, { ability })}
          />
        </label>
        <label>
          持ち物
          <AutocompleteInput
            ariaLabel="持ち物"
            value={build.item}
            options={itemOptions}
            placeholder="例：こだわりスカーフ"
            onChange={(item) => onChange(build.id, { item })}
            onCommit={rememberItem}
          />
        </label>
        <label>
          性格
          <select
            value={build.nature}
            onChange={(event: FieldChangeEvent) => onChange(build.id, { nature: event.target.value })}
          >
            {NATURES.map((nature) => (
              <option key={nature}>{nature}</option>
            ))}
          </select>
        </label>
        <label>
          テラスタイプ
          <select
            value={build.teraType}
            onChange={(event: FieldChangeEvent) =>
              onChange(build.id, { teraType: event.target.value as PokemonType })
            }
          >
            {ALL_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="detail-section">
        <h3>技</h3>
        <div className="move-grid">
          {build.moves.map((move, index) => (
            <AutocompleteInput
              ariaLabel={`技${index + 1}`}
              key={index}
              value={move}
              options={moveOptions}
              maxResults={moveOptions.length}
              placeholder={`技${index + 1}`}
              onChange={(value) => {
                const moves = [...build.moves] as PokemonBuild["moves"];
                moves[index] = value;
                onChange(build.id, { moves });
              }}
            />
          ))}
        </div>
        <p className={`suggestion-status ${suggestionStatus}`} role="status">
          {statusText}
        </p>
      </div>

      <div className="detail-section">
        <div className="inline-heading compact-heading">
          <h3>努力値</h3>
          <span className={evTotal > 510 ? "ev-total invalid" : "ev-total"}>合計 {evTotal} / 510</span>
        </div>
        <div className="ev-grid">
          {statFields.map((field) => (
            <label key={field.key}>
              {field.label}
              <input
                type="number"
                min="0"
                max="252"
                value={build.evs[field.key]}
                onChange={(event: FieldChangeEvent) => {
                  const value = Math.max(0, Math.min(252, Number(event.target.value) || 0));
                  onChange(build.id, { evs: { ...build.evs, [field.key]: value } });
                }}
              />
            </label>
          ))}
        </div>
        {evTotal > 510 && <p className="validation-message">努力値の合計が510を超えています。</p>}
      </div>

      <div className="detail-section">
        <h3>弱点・耐性</h3>
        <MatchupList types={pokemon.types} />
      </div>

      <label>
        メモ
        <textarea
          value={build.memo}
          onChange={(event: FieldChangeEvent) => onChange(build.id, { memo: event.target.value })}
          placeholder="役割、調整意図、使い方など"
        />
      </label>
    </div>
  );
}
