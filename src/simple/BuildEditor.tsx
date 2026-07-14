import { ALL_TYPES, NATURES } from "./data";
import type {
  FieldChangeEvent,
  PokemonBuild,
  PokemonEntry,
  PokemonType,
  TrainingSystem,
} from "./model";
import { MatchupList, TypeBadge } from "./Shared";
import { getPokemon } from "./storage";
import { AutocompleteInput } from "./AutocompleteInput";
import { useBuildSuggestions } from "./suggestions";
import { usePrioritizedItemOptions } from "./itemHistory";
import {
  calculateActualStats,
  DEFAULT_IVS,
  DEFAULT_LEVEL,
  getNatureMultiplier,
  STAT_FIELDS,
} from "./statCalculator";

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

  const trainingSystem: TrainingSystem = build.trainingSystem ?? "traditional";
  const isChampions = trainingSystem === "champions";
  const allocationLabel = isChampions ? "能力ポイント" : "努力値";
  const totalLimit = isChampions ? 66 : 510;
  const perStatLimit = isChampions ? 32 : 252;
  const allocationTotal = Object.values(build.evs).reduce((sum, value) => sum + value, 0);
  const exceedsPerStatLimit = STAT_FIELDS.some((field) => build.evs[field.key] > perStatLimit);
  const exceedsTotalLimit = allocationTotal > totalLimit;
  const allocationInvalid = exceedsPerStatLimit || exceedsTotalLimit;
  const level = Math.max(1, Math.min(100, Math.trunc(build.level ?? DEFAULT_LEVEL)));
  const ivs = build.ivs ?? DEFAULT_IVS;
  const actualStats = calculateActualStats(pokemon, build);

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
        <div className="training-system-row">
          <label>
            育成方式
            <select
              value={trainingSystem}
              onChange={(event: FieldChangeEvent) =>
                onChange(build.id, { trainingSystem: event.target.value as TrainingSystem })
              }
            >
              <option value="traditional">従来作品（努力値）</option>
              <option value="champions">ポケモンチャンピオンズ（能力ポイント）</option>
            </select>
          </label>
          <p className="training-rule-note">
            {isChampions
              ? "合計66、1つの能力につき32まで"
              : "合計510、1つの能力につき252まで"}
          </p>
        </div>

        {!isChampions && (
          <div className="stat-calculation-settings">
            <label className="level-field">
              レベル
              <input
                type="number"
                min="1"
                max="100"
                value={level}
                onChange={(event: FieldChangeEvent) => {
                  const value = Math.max(1, Math.min(100, Number(event.target.value) || 1));
                  onChange(build.id, { level: value });
                }}
              />
            </label>
            <div className="iv-settings">
              <div className="inline-heading compact-heading stat-subheading">
                <h3>個体値</h3>
                <span>各能力 0〜31</span>
              </div>
              <div className="iv-grid">
                {STAT_FIELDS.map((field) => (
                  <label key={field.key}>
                    {field.label}
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={ivs[field.key]}
                      onChange={(event: FieldChangeEvent) => {
                        const value = Math.max(0, Math.min(31, Number(event.target.value) || 0));
                        onChange(build.id, { ivs: { ...ivs, [field.key]: value } });
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {isChampions && (
          <p className="champions-calculation-note">
            Lv.50・個体値31固定です。能力ポイントは式の中で2倍し、計算途中で小数が出るたびに切り捨てます。
          </p>
        )}

        <div className="inline-heading compact-heading training-allocation-heading">
          <h3>{allocationLabel}</h3>
          <span className={allocationInvalid ? "ev-total invalid" : "ev-total"}>
            合計 {allocationTotal} / {totalLimit}
          </span>
        </div>
        <div className="ev-grid">
          {STAT_FIELDS.map((field) => {
            const statInvalid = build.evs[field.key] > perStatLimit;
            return (
              <label key={field.key}>
                {field.label}
                <input
                  type="number"
                  min="0"
                  max={perStatLimit}
                  value={build.evs[field.key]}
                  aria-invalid={statInvalid}
                  onChange={(event: FieldChangeEvent) => {
                    const value = Math.max(
                      0,
                      Math.min(perStatLimit, Number(event.target.value) || 0),
                    );
                    onChange(build.id, { evs: { ...build.evs, [field.key]: value } });
                  }}
                />
              </label>
            );
          })}
        </div>
        {exceedsPerStatLimit && (
          <p className="validation-message">
            1つの能力に割り振れる{allocationLabel}は{perStatLimit}までです。
          </p>
        )}
        {exceedsTotalLimit && (
          <p className="validation-message">
            {allocationLabel}の合計が{totalLimit}を超えています。
          </p>
        )}

        <div className="actual-stat-panel">
          <div className="inline-heading compact-heading actual-stat-heading">
            <h3>実数値</h3>
            <span>{isChampions ? "Lv.50固定" : `Lv.${level}`}</span>
          </div>
          <div className="actual-stat-grid">
            {STAT_FIELDS.map((field) => {
              const natureMultiplier = getNatureMultiplier(build.nature, field.key);
              const modifierClass =
                natureMultiplier > 1 ? "nature-up" : natureMultiplier < 1 ? "nature-down" : "";
              const modifierLabel =
                natureMultiplier > 1 ? "性格↑" : natureMultiplier < 1 ? "性格↓" : "";
              return (
                <div className={`actual-stat-cell ${modifierClass}`} key={field.key}>
                  <span>{field.label}</span>
                  <strong>{actualStats[field.key]}</strong>
                  <small>
                    {field.name}
                    {modifierLabel && ` ${modifierLabel}`}
                  </small>
                </div>
              );
            })}
          </div>
          <p className="calculation-note">
            {isChampions
              ? "チャンピオンズのLv.50・個体値31固定の計算式を使用しています。"
              : "種族値・個体値・努力値・レベル・性格補正から自動計算しています。"}
          </p>
        </div>
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
