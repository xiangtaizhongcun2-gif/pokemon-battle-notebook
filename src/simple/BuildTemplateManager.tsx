import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type {
  AppState,
  BuildTemplate,
  PokemonBuild,
  PokemonEntry,
  Stats,
} from "./model";
import { usePokedex } from "./pokedex";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  createId,
  getPokemon,
  readStoredState,
} from "./storage";

const MAX_TEMPLATES = 100;
const STAT_LABELS: Array<[keyof Stats, string]> = [
  ["hp", "H"],
  ["attack", "A"],
  ["defense", "B"],
  ["specialAttack", "C"],
  ["specialDefense", "D"],
  ["speed", "S"],
];

type ActiveSelection = {
  partyId: string;
  buildId: string;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStats(value: unknown): value is Stats {
  if (!isRecord(value)) return false;
  return STAT_LABELS.every(([key]) => typeof value[key] === "number" && Number.isFinite(value[key]));
}

function isBuildTemplate(value: unknown): value is BuildTemplate {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.speciesId === "string" &&
    typeof value.ability === "string" &&
    typeof value.item === "string" &&
    typeof value.nature === "string" &&
    typeof value.teraType === "string" &&
    Array.isArray(value.moves) &&
    value.moves.length === 4 &&
    value.moves.every((move) => typeof move === "string") &&
    isStats(value.evs) &&
    (value.trainingSystem === undefined ||
      value.trainingSystem === "traditional" ||
      value.trainingSystem === "champions") &&
    (value.level === undefined || typeof value.level === "number") &&
    (value.ivs === undefined || isStats(value.ivs)) &&
    typeof value.memo === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function readTemplates(state: AppState): BuildTemplate[] {
  return Array.isArray(state.buildTemplates)
    ? state.buildTemplates.filter(isBuildTemplate)
    : [];
}

function sameSelection(left: ActiveSelection | null, right: ActiveSelection | null): boolean {
  return left?.partyId === right?.partyId && left?.buildId === right?.buildId;
}

function findActiveSelection(state: AppState): ActiveSelection | null {
  const partyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".party-list-item"));
  const partyIndex = partyButtons.findIndex((button) => button.classList.contains("active"));
  if (partyIndex < 0) return null;

  const memberButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".party-editor .member-card"),
  );
  const memberIndex = memberButtons.findIndex((button) => button.classList.contains("selected"));
  const party = state.parties[partyIndex];
  const build = memberIndex >= 0 ? party?.members[memberIndex] : undefined;
  return party && build ? { partyId: party.id, buildId: build.id } : null;
}

function findBuild(
  state: AppState,
  selection: ActiveSelection | null,
): { build: PokemonBuild; pokemon?: PokemonEntry } | null {
  if (!selection) return null;
  const party = state.parties.find((entry) => entry.id === selection.partyId);
  const build = party?.members.find((entry) => entry.id === selection.buildId);
  return build ? { build } : null;
}

function copyStats(stats: Stats): Stats {
  return { ...stats };
}

function templateFromBuild(
  build: PokemonBuild,
  name: string,
  id = createId("template"),
  createdAt = new Date().toISOString(),
): BuildTemplate {
  return {
    id,
    name,
    speciesId: build.speciesId,
    ability: build.ability,
    item: build.item,
    nature: build.nature,
    teraType: build.teraType,
    moves: [...build.moves] as BuildTemplate["moves"],
    evs: copyStats(build.evs),
    trainingSystem: build.trainingSystem,
    level: build.level,
    ivs: build.ivs ? copyStats(build.ivs) : undefined,
    memo: build.memo,
    createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function uniqueTemplateName(
  requestedName: string,
  templates: BuildTemplate[],
  speciesId: string,
): string {
  const usedNames = new Set(
    templates
      .filter((template) => template.speciesId === speciesId)
      .map((template) => template.name),
  );
  if (!usedNames.has(requestedName)) return requestedName;

  let suffix = 2;
  while (usedNames.has(`${requestedName} ${suffix}`)) suffix += 1;
  return `${requestedName} ${suffix}`;
}

function formatAllocation(template: BuildTemplate): string {
  const values = STAT_LABELS.flatMap(([key, label]) =>
    template.evs[key] > 0 ? [`${label}${template.evs[key]}`] : [],
  );
  return values.length > 0 ? values.join(" / ") : "無振り";
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function writeAppState(state: AppState): void {
  localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent<AppState>(APP_STATE_CHANGED_EVENT, {
      detail: state,
    }),
  );
}

function applyTemplateToBuild(build: PokemonBuild, template: BuildTemplate): PokemonBuild {
  return {
    ...build,
    ability: template.ability,
    item: template.item,
    nature: template.nature,
    teraType: template.teraType,
    moves: [...template.moves] as PokemonBuild["moves"],
    evs: copyStats(template.evs),
    trainingSystem: template.trainingSystem,
    level: template.level,
    ivs: template.ivs ? copyStats(template.ivs) : undefined,
    memo: template.memo,
  };
}

export function BuildTemplateManager() {
  const [appState, setAppState] = useState<AppState>(() => readStoredState());
  const [selection, setSelection] = useState<ActiveSelection | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const { pokedex } = usePokedex();

  useEffect(() => {
    let host: HTMLDivElement | null = null;

    const refresh = () => {
      if (host && !host.isConnected) {
        host = null;
        setPortalTarget(null);
      }

      const heading = document.querySelector<HTMLElement>(".build-editor > .inline-heading");
      if (heading && !host) {
        host = document.createElement("div");
        host.className = "build-template-host";
        heading.insertAdjacentElement("afterend", host);
        setPortalTarget(host);
      }
      if (!heading && host) {
        host.remove();
        host = null;
        setPortalTarget(null);
      }

      const nextSelection = findActiveSelection(readStoredState());
      setSelection((current) => (sameSelection(current, nextSelection) ? current : nextSelection));
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
    const handleStateChanged = (event: Event) => {
      const nextState = (event as CustomEvent<AppState>).detail ?? readStoredState();
      setAppState(nextState);
      const nextSelection = findActiveSelection(nextState);
      setSelection((current) => (sameSelection(current, nextSelection) ? current : nextSelection));
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STATE_STORAGE_KEY) return;
      const nextState = readStoredState();
      setAppState(nextState);
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, handleStateChanged);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, handleStateChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setStatus(null);
    setTemplateName("");
  }, [selection?.buildId]);

  const selected = findBuild(appState, selection);
  const build = selected?.build;
  const pokemon = build ? getPokemon(build.speciesId, pokedex) : undefined;
  const allTemplates = useMemo(() => readTemplates(appState), [appState]);
  const templates = useMemo(
    () =>
      build
        ? allTemplates
            .filter((template) => template.speciesId === build.speciesId)
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        : [],
    [allTemplates, build],
  );

  const saveCurrentBuild = () => {
    if (!build || !pokemon) return;
    const currentState = readStoredState();
    const currentTemplates = readTemplates(currentState);
    if (currentTemplates.length >= MAX_TEMPLATES) {
      setStatus({ type: "error", text: `保存できる型は最大${MAX_TEMPLATES}件です。` });
      return;
    }

    const freshBuild = findBuild(currentState, selection)?.build;
    if (!freshBuild) return;
    const baseName = templateName.trim() || `${pokemon.name}の型`;
    const name = uniqueTemplateName(baseName, currentTemplates, freshBuild.speciesId);
    const template = templateFromBuild(freshBuild, name);
    const nextState: AppState = {
      ...currentState,
      buildTemplates: [...currentTemplates, template],
    };

    try {
      writeAppState(nextState);
      setAppState(nextState);
      setTemplateName("");
      setStatus({ type: "success", text: `「${name}」を保存しました。` });
    } catch {
      setStatus({ type: "error", text: "型を保存できませんでした。" });
    }
  };

  const applyTemplate = (template: BuildTemplate) => {
    if (!selection || !build || template.speciesId !== build.speciesId) return;
    if (!window.confirm(`現在の${pokemon?.name ?? "ポケモン"}へ「${template.name}」を適用しますか？`)) {
      return;
    }

    const currentState = readStoredState();
    const nextState: AppState = {
      ...currentState,
      parties: currentState.parties.map((party) =>
        party.id === selection.partyId
          ? {
              ...party,
              members: party.members.map((member) =>
                member.id === selection.buildId ? applyTemplateToBuild(member, template) : member,
              ),
            }
          : party,
      ),
    };

    try {
      writeAppState(nextState);
      setAppState(nextState);
      setStatus({ type: "success", text: `「${template.name}」を適用しました。` });
    } catch {
      setStatus({ type: "error", text: "型を適用できませんでした。" });
    }
  };

  const overwriteTemplate = (template: BuildTemplate) => {
    if (!build || !window.confirm(`「${template.name}」を現在の育成内容で上書きしますか？`)) return;
    const currentState = readStoredState();
    const freshBuild = findBuild(currentState, selection)?.build;
    if (!freshBuild) return;
    const currentTemplates = readTemplates(currentState);
    const nextTemplates = currentTemplates.map((entry) =>
      entry.id === template.id
        ? templateFromBuild(freshBuild, entry.name, entry.id, entry.createdAt)
        : entry,
    );
    const nextState: AppState = { ...currentState, buildTemplates: nextTemplates };

    try {
      writeAppState(nextState);
      setAppState(nextState);
      setStatus({ type: "success", text: `「${template.name}」を更新しました。` });
    } catch {
      setStatus({ type: "error", text: "型を更新できませんでした。" });
    }
  };

  const deleteTemplate = (template: BuildTemplate) => {
    if (!window.confirm(`「${template.name}」を削除しますか？`)) return;
    const currentState = readStoredState();
    const nextState: AppState = {
      ...currentState,
      buildTemplates: readTemplates(currentState).filter((entry) => entry.id !== template.id),
    };

    try {
      writeAppState(nextState);
      setAppState(nextState);
      setStatus({ type: "success", text: `「${template.name}」を削除しました。` });
    } catch {
      setStatus({ type: "error", text: "型を削除できませんでした。" });
    }
  };

  if (!portalTarget || !build || !pokemon) return null;

  return createPortal(
    <section className="build-template-manager" aria-labelledby="build-template-title">
      <div className="build-template-heading">
        <div>
          <p className="eyebrow">BUILD LIBRARY</p>
          <h3 id="build-template-title">型テンプレート</h3>
          <p>{pokemon.name}の育成内容を別のパーティでも再利用できます。</p>
        </div>
        <span>{templates.length}件</span>
      </div>

      <div className="build-template-save-row">
        <label>
          保存名
          <input
            value={templateName}
            maxLength={40}
            onChange={(event) => setTemplateName(event.target.value)}
            placeholder={`例：${pokemon.name} こだわり型`}
          />
        </label>
        <button className="primary-button" type="button" onClick={saveCurrentBuild}>
          現在の型を保存
        </button>
      </div>

      {status && (
        <p className={`build-template-status ${status.type}`} role="status">
          {status.text}
        </p>
      )}

      {templates.length === 0 ? (
        <p className="build-template-empty">このポケモンの保存済みテンプレートはありません。</p>
      ) : (
        <div className="build-template-list">
          {templates.map((template) => {
            const moves = template.moves.filter(Boolean);
            return (
              <article className="build-template-card" key={template.id}>
                <div className="build-template-card-heading">
                  <div>
                    <strong>{template.name}</strong>
                    <small>更新 {formatUpdatedAt(template.updatedAt)}</small>
                  </div>
                  <span>
                    {template.trainingSystem === "champions" ? "チャンピオンズ" : "従来作品"}
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>性格・持ち物</dt>
                    <dd>{template.nature} / {template.item || "持ち物なし"}</dd>
                  </div>
                  <div>
                    <dt>配分</dt>
                    <dd>{formatAllocation(template)}</dd>
                  </div>
                  <div>
                    <dt>技</dt>
                    <dd>{moves.length > 0 ? moves.join(" / ") : "未登録"}</dd>
                  </div>
                </dl>
                <div className="build-template-actions">
                  <button className="primary-button" type="button" onClick={() => applyTemplate(template)}>
                    適用
                  </button>
                  <button className="secondary-button" type="button" onClick={() => overwriteTemplate(template)}>
                    現在の内容で上書き
                  </button>
                  <button className="danger-text-button" type="button" onClick={() => deleteTemplate(template)}>
                    削除
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="build-template-note">
        テンプレートとパーティ内の育成内容は別々に保存されます。適用後の編集で保存済みの型が変わることはありません。
      </p>
    </section>,
    portalTarget,
  );
}
