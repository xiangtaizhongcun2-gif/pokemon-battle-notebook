import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AutocompleteInput } from "./AutocompleteInput";
import {
  calculateDamage,
  formatKoRange,
  oneHitProbability,
  type StatStage,
} from "./damageCalculation";
import { ALL_TYPES } from "./data";
import { getTypeMultiplier } from "./matchups";
import type {
  AppState,
  BuildTemplate,
  PokemonBuild,
  PokemonEntry,
  PokemonType,
  Stats,
} from "./model";
import { findMoveMetadata, useMoveTypeCatalog, type MoveCategory } from "./moveTypeCatalog";
import { usePokedex } from "./pokedex";
import { calculateActualStats, DEFAULT_IVS, DEFAULT_LEVEL, STAT_FIELDS } from "./statCalculator";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  emptyStats,
  getPokemon,
  readStoredState,
} from "./storage";

const STAGES: StatStage[] = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

type SideState = {
  sourceKey: string;
  sourceLabel: string;
  search: string;
  pokemonId: string;
  level: number;
  stats: Stats;
  teraType: PokemonType;
  teraActive: boolean;
};

type SavedSource = {
  key: string;
  label: string;
  build: PokemonBuild;
};

type SidePanelProps = {
  title: string;
  side: SideState;
  pokemon?: PokemonEntry;
  pokemonOptions: string[];
  savedSources: SavedSource[];
  onChange: (next: SideState) => void;
  onCommitPokemon: (value: string) => void;
  onLoadSource: (key: string) => void;
};

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function pokemonOption(pokemon: PokemonEntry): string {
  return `${pokemon.name}｜${pokemon.englishName}｜No.${String(pokemon.number).padStart(4, "0")}`;
}

function findPokemonByOption(value: string, pokedex: PokemonEntry[]): PokemonEntry | undefined {
  const normalized = normalize(value);
  return pokedex.find((pokemon) => {
    const number = String(pokemon.number);
    return (
      normalize(pokemonOption(pokemon)) === normalized ||
      normalize(pokemon.name) === normalized ||
      normalize(pokemon.englishName) === normalized ||
      normalized === number ||
      normalized === `no.${number}`
    );
  });
}

function defaultBuild(pokemon: PokemonEntry): PokemonBuild {
  return {
    id: "damage-default",
    speciesId: pokemon.id,
    ability: pokemon.abilities[0] ?? "",
    item: "",
    nature: "まじめ",
    teraType: pokemon.types[0],
    moves: ["", "", "", ""],
    evs: emptyStats(),
    trainingSystem: "traditional",
    level: DEFAULT_LEVEL,
    ivs: { ...DEFAULT_IVS },
    memo: "",
  };
}

function templateAsBuild(template: BuildTemplate): PokemonBuild {
  return {
    id: template.id,
    speciesId: template.speciesId,
    ability: template.ability,
    item: template.item,
    nature: template.nature,
    teraType: template.teraType,
    moves: [...template.moves] as PokemonBuild["moves"],
    evs: { ...template.evs },
    trainingSystem: template.trainingSystem,
    level: template.level,
    ivs: template.ivs ? { ...template.ivs } : undefined,
    memo: template.memo,
  };
}

function sideFromBuild(
  pokemon: PokemonEntry,
  build: PokemonBuild,
  sourceKey = "",
  sourceLabel = "図鑑から直接選択",
): SideState {
  return {
    sourceKey,
    sourceLabel,
    search: pokemonOption(pokemon),
    pokemonId: pokemon.id,
    level: build.trainingSystem === "champions" ? 50 : build.level ?? DEFAULT_LEVEL,
    stats: { ...calculateActualStats(pokemon, build) },
    teraType: build.teraType,
    teraActive: false,
  };
}

function weatherMultiplier(weather: string, moveType: PokemonType): number {
  if (weather === "rain") {
    if (moveType === "みず") return 1.5;
    if (moveType === "ほのお") return 0.5;
  }
  if (weather === "sun") {
    if (moveType === "ほのお") return 1.5;
    if (moveType === "みず") return 0.5;
  }
  return 1;
}

function automaticStab(attacker: PokemonEntry, side: SideState, moveType: PokemonType): number {
  const originalMatch = attacker.types.includes(moveType);
  if (!side.teraActive) return originalMatch ? 1.5 : 1;
  const teraMatch = side.teraType === moveType;
  if (teraMatch && attacker.types.includes(side.teraType)) return 2;
  return teraMatch || originalMatch ? 1.5 : 1;
}

function numberValue(value: string, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
}

function SidePanel({
  title,
  side,
  pokemon,
  pokemonOptions,
  savedSources,
  onChange,
  onCommitPokemon,
  onLoadSource,
}: SidePanelProps) {
  return (
    <section className="damage-side-card">
      <div className="damage-card-heading">
        <div>
          <p className="eyebrow">{title === "攻撃側" ? "ATTACKER" : "DEFENDER"}</p>
          <h2>{title}</h2>
        </div>
        {pokemon && <span>No.{String(pokemon.number).padStart(4, "0")}</span>}
      </div>

      <label>
        保存済み育成を読み込む
        <select value={side.sourceKey} onChange={(event) => onLoadSource(event.target.value)}>
          <option value="">図鑑から直接選択</option>
          {savedSources.map((source) => (
            <option value={source.key} key={source.key}>{source.label}</option>
          ))}
        </select>
      </label>

      <label>
        ポケモン
        <AutocompleteInput
          ariaLabel={`${title}のポケモン`}
          value={side.search}
          options={pokemonOptions}
          maxResults={16}
          placeholder="名前・英語名・図鑑番号"
          onChange={(search) => onChange({ ...side, search, sourceKey: "", sourceLabel: "図鑑から直接選択" })}
          onCommit={onCommitPokemon}
        />
      </label>

      {pokemon && (
        <>
          <div className="damage-type-row">
            <span>通常タイプ</span>
            <strong>{pokemon.types.join(" / ")}</strong>
          </div>
          <div className="damage-side-settings">
            <label>
              レベル
              <input
                type="number"
                min="1"
                max="100"
                value={side.level}
                onChange={(event) => onChange({ ...side, level: numberValue(event.target.value, 50, 1, 100) })}
              />
            </label>
            <label>
              テラスタイプ
              <select
                value={side.teraType}
                onChange={(event) => onChange({ ...side, teraType: event.target.value as PokemonType })}
              >
                {ALL_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
          </div>
          <label className="damage-check-row">
            <input
              type="checkbox"
              checked={side.teraActive}
              onChange={(event) => onChange({ ...side, teraActive: event.target.checked })}
            />
            テラスタル中として計算
          </label>

          <div className="damage-stat-grid">
            {STAT_FIELDS.map((field) => (
              <label key={field.key}>
                {field.label}
                <input
                  type="number"
                  min="1"
                  value={side.stats[field.key]}
                  onChange={(event) => onChange({
                    ...side,
                    stats: {
                      ...side.stats,
                      [field.key]: numberValue(event.target.value, 1, 1, 9999),
                    },
                  })}
                />
              </label>
            ))}
          </div>
          <p className="damage-source-label">読込元：{side.sourceLabel}</p>
        </>
      )}
    </section>
  );
}

export function DamageCalculatorMount() {
  const { pokedex } = usePokedex();
  const { moves: moveCatalog, status: moveStatus } = useMoveTypeCatalog();
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [active, setActive] = useState(false);
  const [navButton, setNavButton] = useState<HTMLButtonElement | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const firstPokemon = pokedex[0];
  const [attacker, setAttacker] = useState<SideState | null>(null);
  const [defender, setDefender] = useState<SideState | null>(null);
  const [moveName, setMoveName] = useState("じしん");
  const [moveType, setMoveType] = useState<PokemonType>("じめん");
  const [category, setCategory] = useState<MoveCategory>("physical");
  const [power, setPower] = useState(100);
  const [attackStage, setAttackStage] = useState<StatStage>(0);
  const [defenseStage, setDefenseStage] = useState<StatStage>(0);
  const [stabMode, setStabMode] = useState("auto");
  const [typeMode, setTypeMode] = useState("auto");
  const [weather, setWeather] = useState("none");
  const [critical, setCritical] = useState(false);
  const [burn, setBurn] = useState(false);
  const [screen, setScreen] = useState(false);
  const [doubleBattle, setDoubleBattle] = useState(false);
  const [spread, setSpread] = useState(false);
  const [otherMultiplier, setOtherMultiplier] = useState(1);

  useEffect(() => {
    if (!firstPokemon) return;
    setAttacker((current) => current ?? sideFromBuild(firstPokemon, defaultBuild(firstPokemon)));
    const second = pokedex[1] ?? firstPokemon;
    setDefender((current) => current ?? sideFromBuild(second, defaultBuild(second)));
  }, [firstPokemon, pokedex]);

  useEffect(() => {
    let button: HTMLButtonElement | null = null;
    const root = document.getElementById("root") ?? document.body;
    const attach = () => {
      const nav = root.querySelector<HTMLElement>(".app-header nav");
      if (!nav) return;
      const existing = nav.querySelector<HTMLButtonElement>(".damage-calculator-nav-button");
      if (existing) {
        button = existing;
        setNavButton(existing);
        return;
      }
      button = document.createElement("button");
      button.type = "button";
      button.className = "nav-button damage-calculator-nav-button";
      button.textContent = "ダメージ計算";
      button.addEventListener("click", () => setActive(true));
      nav.appendChild(button);
      setNavButton(button);
    };
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(root, { childList: true, subtree: true });
    const returnToApp = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const clicked = target?.closest(".nav-button, .brand");
      if (clicked && clicked !== button) setActive(false);
    };
    document.addEventListener("click", returnToApp);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", returnToApp);
      button?.remove();
      setNavButton(null);
    };
  }, []);

  useEffect(() => {
    if (!navButton) return;
    const root = document.getElementById("root") ?? document.body;
    const originalMain = root.querySelector<HTMLElement>("main.page:not(.damage-calculator-page)");
    if (!active) {
      navButton.classList.remove("active");
      if (originalMain) originalMain.hidden = false;
      setPortalTarget(null);
      return;
    }

    root.querySelectorAll(".app-header .nav-button").forEach((button) => button.classList.remove("active"));
    navButton.classList.add("active");
    if (originalMain) originalMain.hidden = true;
    const host = document.createElement("main");
    host.className = "page damage-calculator-page";
    originalMain?.insertAdjacentElement("afterend", host);
    setPortalTarget(host);

    return () => {
      host.remove();
      if (originalMain) originalMain.hidden = false;
      navButton.classList.remove("active");
    };
  }, [active, navButton]);

  useEffect(() => {
    const update = (event?: Event) => {
      const detail = event instanceof CustomEvent ? (event.detail as AppState | undefined) : undefined;
      setAppState(detail ?? readStoredState());
    };
    const storage = (event: StorageEvent) => {
      if (event.key === APP_STATE_STORAGE_KEY) update();
    };
    window.addEventListener(APP_STATE_CHANGED_EVENT, update);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, update);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const pokemonOptions = useMemo(() => pokedex.map(pokemonOption), [pokedex]);
  const moveOptions = useMemo(
    () => [...new Set(Object.values(moveCatalog).map((move) => move.name))].sort((a, b) => a.localeCompare(b, "ja")),
    [moveCatalog],
  );
  const savedSources = useMemo<SavedSource[]>(() => {
    const partySources = appState.parties.flatMap((party) =>
      party.members.map((build) => {
        const pokemon = getPokemon(build.speciesId, pokedex);
        return {
          key: `party:${party.id}:${build.id}`,
          label: `パーティ｜${party.name || "名前なし"}｜${pokemon?.name ?? build.speciesId}`,
          build,
        };
      }),
    );
    const templateSources = (appState.buildTemplates ?? []).map((template) => {
      const pokemon = getPokemon(template.speciesId, pokedex);
      return {
        key: `template:${template.id}`,
        label: `型｜${pokemon?.name ?? template.speciesId}｜${template.name}`,
        build: templateAsBuild(template),
      };
    });
    return [...partySources, ...templateSources];
  }, [appState, pokedex]);

  const attackerPokemon = attacker ? getPokemon(attacker.pokemonId, pokedex) : undefined;
  const defenderPokemon = defender ? getPokemon(defender.pokemonId, pokedex) : undefined;

  const loadPokemon = (value: string, current: SideState | null, setter: (side: SideState) => void) => {
    const pokemon = findPokemonByOption(value, pokedex);
    if (!pokemon) return;
    const side = sideFromBuild(pokemon, defaultBuild(pokemon));
    setter({ ...side, teraActive: current?.teraActive ?? false });
  };

  const loadSource = (key: string, current: SideState | null, setter: (side: SideState) => void) => {
    if (!key) {
      if (current) setter({ ...current, sourceKey: "", sourceLabel: "図鑑から直接選択" });
      return;
    }
    const source = savedSources.find((entry) => entry.key === key);
    const pokemon = source ? getPokemon(source.build.speciesId, pokedex) : undefined;
    if (!source || !pokemon) return;
    setter(sideFromBuild(pokemon, source.build, source.key, source.label));
  };

  const updateMove = (value: string) => {
    setMoveName(value);
    const metadata = findMoveMetadata(moveCatalog, value);
    if (!metadata) return;
    setMoveType(metadata.type);
    setCategory(metadata.category);
    if (metadata.power !== null) setPower(metadata.power);
  };

  const resolvedTeraBlast = normalize(moveName) === normalize("テラバースト") && Boolean(attacker?.teraActive);
  const resolvedMoveType = resolvedTeraBlast && attacker ? attacker.teraType : moveType;
  const resolvedCategory: MoveCategory =
    resolvedTeraBlast && attacker
      ? attacker.stats.attack > attacker.stats.specialAttack ? "physical" : "special"
      : category;
  const defenderTypes = defenderPokemon && defender
    ? defender.teraActive ? [defender.teraType] : defenderPokemon.types
    : [];
  const automaticType = defenderTypes.length > 0 ? getTypeMultiplier(resolvedMoveType, defenderTypes) : 1;
  const typeEffectiveness = typeMode === "auto" ? automaticType : Number(typeMode);
  const stab = attackerPokemon && attacker
    ? stabMode === "auto" ? automaticStab(attackerPokemon, attacker, resolvedMoveType) : Number(stabMode)
    : 1;
  const attackStat = attacker
    ? resolvedCategory === "physical" ? attacker.stats.attack : attacker.stats.specialAttack
    : 1;
  const defenseStat = defender
    ? resolvedCategory === "physical" ? defender.stats.defense : defender.stats.specialDefense
    : 1;
  const appliedAttackStage = critical && attackStage < 0 ? 0 : attackStage;
  const appliedDefenseStage = critical && defenseStage > 0 ? 0 : defenseStage;
  const result = attacker && defender
    ? calculateDamage({
        level: attacker.level,
        power,
        attack: attackStat,
        defense: defenseStat,
        attackStage: appliedAttackStage,
        defenseStage: appliedDefenseStage,
        stab,
        typeEffectiveness,
        weather: weatherMultiplier(weather, resolvedMoveType),
        critical,
        burn: burn && resolvedCategory === "physical",
        screen: screen ? doubleBattle ? 2 / 3 : 0.5 : 1,
        spread: doubleBattle && spread,
        other: otherMultiplier,
      })
    : null;
  const hp = defender?.stats.hp ?? 1;
  const minimumPercent = result ? (result.minimum / hp) * 100 : 0;
  const maximumPercent = result ? (result.maximum / hp) * 100 : 0;
  const ohko = result ? oneHitProbability(hp, result.rolls) : 0;

  if (!portalTarget || !attacker || !defender) return null;

  return createPortal(
    <section className="damage-calculator" aria-labelledby="damage-calculator-title">
      <div className="page-heading damage-page-heading">
        <div>
          <p className="eyebrow">DAMAGE CALCULATOR</p>
          <h1 id="damage-calculator-title">ダメージ計算</h1>
          <p>第9世代の基本式で、保存した育成内容と16段階の乱数を確認できます。</p>
        </div>
        <button
          className="secondary-button damage-swap-button"
          type="button"
          onClick={() => {
            setAttacker(defender);
            setDefender(attacker);
          }}
        >
          ⇄ 攻守を入れ替え
        </button>
      </div>

      <div className="damage-side-layout">
        <SidePanel
          title="攻撃側"
          side={attacker}
          pokemon={attackerPokemon}
          pokemonOptions={pokemonOptions}
          savedSources={savedSources}
          onChange={setAttacker}
          onCommitPokemon={(value) => loadPokemon(value, attacker, setAttacker)}
          onLoadSource={(key) => loadSource(key, attacker, setAttacker)}
        />
        <SidePanel
          title="防御側"
          side={defender}
          pokemon={defenderPokemon}
          pokemonOptions={pokemonOptions}
          savedSources={savedSources}
          onChange={setDefender}
          onCommitPokemon={(value) => loadPokemon(value, defender, setDefender)}
          onLoadSource={(key) => loadSource(key, defender, setDefender)}
        />
      </div>

      <section className="damage-move-card">
        <div className="damage-card-heading">
          <div><p className="eyebrow">MOVE & FIELD</p><h2>技と補正</h2></div>
          <span className={`move-catalog-status ${moveStatus}`}>{moveStatus === "loading" ? "技データ読込中" : moveStatus === "ready" ? "技データ準備完了" : "一部の技のみ"}</span>
        </div>
        <div className="damage-move-grid">
          <label>
            技名
            <AutocompleteInput
              ariaLabel="ダメージ計算の技"
              value={moveName}
              options={moveOptions}
              maxResults={20}
              placeholder="技名を入力"
              onChange={updateMove}
              onCommit={updateMove}
            />
          </label>
          <label>
            威力
            <input type="number" min="0" max="999" value={power} onChange={(event) => setPower(numberValue(event.target.value, 0, 0, 999))} />
          </label>
          <label>
            タイプ
            <select value={moveType} onChange={(event) => setMoveType(event.target.value as PokemonType)}>
              {ALL_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            分類
            <select value={category} onChange={(event) => setCategory(event.target.value as MoveCategory)}>
              <option value="physical">物理</option>
              <option value="special">特殊</option>
              <option value="status">変化</option>
            </select>
          </label>
          <label>
            攻撃ランク
            <select value={attackStage} onChange={(event) => setAttackStage(Number(event.target.value) as StatStage)}>
              {STAGES.map((stage) => <option value={stage} key={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
            </select>
          </label>
          <label>
            防御ランク
            <select value={defenseStage} onChange={(event) => setDefenseStage(Number(event.target.value) as StatStage)}>
              {STAGES.map((stage) => <option value={stage} key={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
            </select>
          </label>
          <label>
            タイプ一致
            <select value={stabMode} onChange={(event) => setStabMode(event.target.value)}>
              <option value="auto">自動</option><option value="1">なし</option><option value="1.5">×1.5</option><option value="2">×2</option>
            </select>
          </label>
          <label>
            タイプ相性
            <select value={typeMode} onChange={(event) => setTypeMode(event.target.value)}>
              <option value="auto">自動</option><option value="0">×0</option><option value="0.25">×0.25</option><option value="0.5">×0.5</option><option value="1">×1</option><option value="2">×2</option><option value="4">×4</option>
            </select>
          </label>
          <label>
            天候
            <select value={weather} onChange={(event) => setWeather(event.target.value)}>
              <option value="none">なし</option><option value="rain">雨</option><option value="sun">晴れ</option>
            </select>
          </label>
          <label>
            その他の倍率
            <input type="number" min="0" max="10" step="0.01" value={otherMultiplier} onChange={(event) => setOtherMultiplier(numberValue(event.target.value, 1, 0, 10))} />
          </label>
        </div>
        <div className="damage-toggle-grid">
          <label><input type="checkbox" checked={critical} onChange={(event) => setCritical(event.target.checked)} />急所</label>
          <label><input type="checkbox" checked={burn} onChange={(event) => setBurn(event.target.checked)} />攻撃側がやけど</label>
          <label><input type="checkbox" checked={screen} onChange={(event) => setScreen(event.target.checked)} />リフレクター／ひかりのかべ</label>
          <label><input type="checkbox" checked={doubleBattle} onChange={(event) => setDoubleBattle(event.target.checked)} />ダブルバトル</label>
          <label><input type="checkbox" checked={spread} disabled={!doubleBattle} onChange={(event) => setSpread(event.target.checked)} />範囲技補正</label>
        </div>
        {resolvedTeraBlast && <p className="damage-helper">テラバーストは攻撃側のテラスタイプと、A・Cの高い方を自動使用しています。</p>}
        {category === "status" && <p className="damage-warning">変化技はダメージを与えません。分類または技名を確認してください。</p>}
      </section>

      <section className="damage-result-card" aria-live="polite">
        <div className="damage-result-heading">
          <div>
            <p className="eyebrow">RESULT</p>
            <h2>{attackerPokemon?.name ?? "攻撃側"}の{moveName || "技"} → {defenderPokemon?.name ?? "防御側"}</h2>
          </div>
          <strong className="damage-ko-label">{result ? formatKoRange(hp, result.minimum, result.maximum) : "—"}</strong>
        </div>
        <div className="damage-result-summary">
          <div><span>ダメージ</span><strong>{result?.minimum ?? 0}〜{result?.maximum ?? 0}</strong></div>
          <div><span>HP割合</span><strong>{minimumPercent.toFixed(1)}〜{maximumPercent.toFixed(1)}%</strong></div>
          <div><span>1発で倒す確率</span><strong>{ohko.toFixed(1)}%</strong></div>
          <div><span>相性・一致</span><strong>×{typeEffectiveness} / ×{stab}</strong></div>
        </div>
        <div className="damage-hp-bar" aria-label={`最大ダメージでHPの${Math.min(100, maximumPercent).toFixed(1)}%`}>
          <span style={{ width: `${Math.min(100, maximumPercent)}%` }} />
        </div>
        <div className="damage-rolls">
          {(result?.rolls ?? []).map((damage, index) => (
            <span className={damage >= hp ? "ko" : ""} key={`${damage}-${index}`}>{85 + index}%：{damage}</span>
          ))}
        </div>
        <p className="damage-formula-detail">
          使用実数値：攻撃 {result?.effectiveAttack ?? 0} / 防御 {result?.effectiveDefense ?? 0}。急所時は攻撃側のマイナスランクと防御側のプラスランクを無視します。
        </p>
      </section>

      <p className="damage-calculator-note">
        第9世代の基本ダメージ式を対象にした計算です。技ごとの特殊処理、特性、持ち物、フィールドなどは自動対応していないため、「その他の倍率」や威力・タイプ・分類の手動変更で調整してください。チャンピオンズの型は実数値のみ読み込み、ダメージ式はこの基本式を使用します。
      </p>
    </section>,
    portalTarget,
  );
}
