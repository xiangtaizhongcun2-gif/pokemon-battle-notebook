import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AutocompleteInput } from "./AutocompleteInput";
import type { AppState, PokemonBuild, PokemonEntry, Stats, TrainingSystem } from "./model";
import { usePokedex } from "./pokedex";
import {
  calculateActualStats,
  DEFAULT_IVS,
  DEFAULT_LEVEL,
} from "./statCalculator";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  getPokemon,
  readStoredState,
} from "./storage";

const EMPTY_STATS: Stats = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

type SpeedLine = {
  id: "fastest" | "max-neutral" | "uninvested";
  label: string;
  description: string;
  allocation: number;
  nature: string;
};

function formatPokemonOption(pokemon: PokemonEntry): string {
  return `No.${String(pokemon.number).padStart(4, "0")} ${pokemon.name} / ${pokemon.englishName}`;
}

function getActiveBuildId(state: AppState): string | null {
  const partyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".party-list-item"));
  const partyIndex = partyButtons.findIndex((button) => button.classList.contains("active"));
  if (partyIndex < 0) return null;

  const memberCards = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".member-grid > .member-card"),
  );
  const memberIndex = memberCards.findIndex((card) => card.classList.contains("selected"));
  if (memberIndex < 0) return null;

  return state.parties[partyIndex]?.members[memberIndex]?.id ?? null;
}

function findBuild(state: AppState, buildId: string | null): PokemonBuild | undefined {
  if (!buildId) return undefined;
  for (const party of state.parties) {
    const build = party.members.find((member) => member.id === buildId);
    if (build) return build;
  }
  return undefined;
}

function createTargetBuild(
  sourceBuild: PokemonBuild,
  target: PokemonEntry,
  trainingSystem: TrainingSystem,
  level: number,
  allocation: number,
  nature: string,
): PokemonBuild {
  return {
    ...sourceBuild,
    id: "speed-comparison-target",
    speciesId: target.id,
    nature,
    trainingSystem,
    level,
    ivs: { ...DEFAULT_IVS },
    evs: { ...EMPTY_STATS, speed: allocation },
  };
}

function findMinimumAllocation(
  pokemon: PokemonEntry,
  build: PokemonBuild,
  targetSpeed: number,
  maximum: number,
): number | null {
  for (let allocation = 0; allocation <= maximum; allocation += 1) {
    const candidate: PokemonBuild = {
      ...build,
      evs: { ...build.evs, speed: allocation },
    };
    if (calculateActualStats(pokemon, candidate).speed > targetSpeed) {
      return allocation;
    }
  }
  return null;
}

function comparisonLabel(currentSpeed: number, targetSpeed: number): {
  text: string;
  className: string;
} {
  if (currentSpeed > targetSpeed) {
    return { text: `抜いています（+${currentSpeed - targetSpeed}）`, className: "ahead" };
  }
  if (currentSpeed === targetSpeed) {
    return { text: "同速です", className: "tied" };
  }
  return {
    text: `抜くには実数値があと${targetSpeed - currentSpeed + 1}必要`,
    className: "behind",
  };
}

export function SpeedComparison() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { pokedex } = usePokedex();
  const [targetId, setTargetId] = useState("");
  const [targetQuery, setTargetQuery] = useState("");

  useEffect(() => {
    let host: HTMLDivElement | null = null;

    const refresh = () => {
      if (host && !host.isConnected) {
        host = null;
        setPortalTarget(null);
      }

      const actualStatPanel = document.querySelector<HTMLElement>(".build-editor .actual-stat-panel");
      if (actualStatPanel && host === null) {
        host = document.createElement("div");
        host.className = "speed-comparison-host";
        actualStatPanel.insertAdjacentElement("afterend", host);
        setPortalTarget(host);
      }

      if (!actualStatPanel && host !== null) {
        host.remove();
        host = null;
        setPortalTarget(null);
      }

      setActiveBuildId(getActiveBuildId(readStoredState()));
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      host?.remove();
    };
  }, []);

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const detail = (event as CustomEvent<AppState>).detail;
      const nextState = detail ?? readStoredState();
      setAppState(nextState);
      setActiveBuildId(getActiveBuildId(nextState));
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STATE_STORAGE_KEY) return;
      const nextState = readStoredState();
      setAppState(nextState);
      setActiveBuildId(getActiveBuildId(nextState));
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, handleStateChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const build = useMemo(() => findBuild(appState, activeBuildId), [activeBuildId, appState]);
  const pokemon = build ? getPokemon(build.speciesId, pokedex) : undefined;

  const targetOptions = useMemo(
    () => pokedex.map((entry) => ({ id: entry.id, label: formatPokemonOption(entry) })),
    [pokedex],
  );
  const targetByLabel = useMemo(
    () => new Map(targetOptions.map((option) => [option.label, option.id])),
    [targetOptions],
  );
  const optionLabels = useMemo(() => targetOptions.map((option) => option.label), [targetOptions]);

  useEffect(() => {
    if (targetId && pokedex.some((entry) => entry.id === targetId)) return;
    const initialTarget =
      pokedex.find((entry) => entry.id === "garchomp") ??
      pokedex.find((entry) => entry.id !== build?.speciesId) ??
      pokedex[0];
    if (!initialTarget) return;
    setTargetId(initialTarget.id);
    setTargetQuery(formatPokemonOption(initialTarget));
  }, [build?.speciesId, pokedex, targetId]);

  const chooseTarget = (rawValue: string) => {
    const exactId = targetByLabel.get(rawValue);
    if (exactId) {
      setTargetId(exactId);
      setTargetQuery(rawValue);
      return;
    }

    const normalized = rawValue.trim().toLocaleLowerCase("ja");
    const firstMatch = targetOptions.find((option) =>
      option.label.toLocaleLowerCase("ja").includes(normalized),
    );
    if (normalized && firstMatch) {
      setTargetId(firstMatch.id);
      setTargetQuery(firstMatch.label);
    }
  };

  if (!portalTarget || !build || !pokemon) return null;

  const target = pokedex.find((entry) => entry.id === targetId);
  const trainingSystem: TrainingSystem = build.trainingSystem ?? "traditional";
  const isChampions = trainingSystem === "champions";
  const maximumAllocation = isChampions ? 32 : 252;
  const allocationLabel = isChampions ? "能力ポイント" : "努力値";
  const level = isChampions
    ? DEFAULT_LEVEL
    : Math.max(1, Math.min(100, Math.trunc(build.level ?? DEFAULT_LEVEL)));
  const currentSpeed = calculateActualStats(pokemon, build).speed;

  const speedLines: SpeedLine[] = [
    {
      id: "fastest",
      label: "最速",
      description: `S上昇性格・${allocationLabel}${maximumAllocation}`,
      allocation: maximumAllocation,
      nature: "ようき",
    },
    {
      id: "max-neutral",
      label: "準速",
      description: `無補正性格・${allocationLabel}${maximumAllocation}`,
      allocation: maximumAllocation,
      nature: "まじめ",
    },
    {
      id: "uninvested",
      label: "無振り",
      description: `無補正性格・${allocationLabel}0` ,
      allocation: 0,
      nature: "まじめ",
    },
  ];

  return createPortal(
    <section className="speed-comparison" aria-labelledby="speed-comparison-title">
      <div className="speed-comparison-heading">
        <div>
          <p className="eyebrow">SPEED CHECK</p>
          <h3 id="speed-comparison-title">素早さ比較・調整ライン</h3>
        </div>
        <div className="current-speed-badge">
          <span>現在のS</span>
          <strong>{currentSpeed}</strong>
        </div>
      </div>

      <label className="speed-target-field">
        比較するポケモン
        <AutocompleteInput
          ariaLabel="素早さの比較対象"
          value={targetQuery}
          options={optionLabels}
          maxResults={20}
          placeholder="名前・英語名・図鑑番号で検索"
          onChange={(value) => {
            setTargetQuery(value);
            const exactId = targetByLabel.get(value);
            if (exactId) setTargetId(exactId);
          }}
          onCommit={chooseTarget}
        />
      </label>

      {target ? (
        <div className="speed-line-list">
          <div className="speed-target-summary">
            <strong>{target.name}</strong>
            <span>種族値S {target.stats.speed}・{isChampions ? "Lv.50固定" : `Lv.${level}`}・個体値31</span>
          </div>

          {speedLines.map((line) => {
            const targetBuild = createTargetBuild(
              build,
              target,
              trainingSystem,
              level,
              line.allocation,
              line.nature,
            );
            const targetSpeed = calculateActualStats(target, targetBuild).speed;
            const comparison = comparisonLabel(currentSpeed, targetSpeed);
            const minimumAllocation = findMinimumAllocation(
              pokemon,
              build,
              targetSpeed,
              maximumAllocation,
            );

            return (
              <div className="speed-line-row" key={line.id}>
                <div className="speed-line-name">
                  <strong>{line.label}</strong>
                  <small>{line.description}</small>
                </div>
                <div className="speed-line-value">
                  <span>実数値</span>
                  <strong>{targetSpeed}</strong>
                </div>
                <div className={`speed-line-result ${comparison.className}`}>
                  <strong>{comparison.text}</strong>
                  <small>
                    {minimumAllocation === null
                      ? `現在の性格・個体値では${allocationLabel}上限でも抜けません`
                      : `抜くための必要最小：S${allocationLabel} ${minimumAllocation}`}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="speed-comparison-empty">候補から比較するポケモンを選択してください。</p>
      )}

      <p className="speed-comparison-note">
        持ち物・特性・天候・ランク補正は含めず、通常時の素早さ実数値を比較しています。
      </p>
    </section>,
    portalTarget,
  );
}
