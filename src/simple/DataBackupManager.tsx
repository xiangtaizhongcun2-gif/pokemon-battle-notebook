import { useEffect, useRef, useState } from "react";
import type { AppState, BattleLog, Party, PokemonBuild, Stats } from "./model";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
  readStoredState,
} from "./storage";

const BACKUP_FORMAT = "pokemon-battle-notebook-backup";
const BACKUP_VERSION = 1;
const MAX_BACKUP_FILE_SIZE = 10 * 1024 * 1024;
const RECENT_ITEMS_STORAGE_KEY = "pokemon-battle-notebook.recent-items.v1";

type BackupPayload = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  appState: AppState;
  preferences: {
    recentItems: string[];
  };
};

type ParsedBackup = {
  appState: AppState;
  exportedAt: string | null;
  recentItems: string[] | null;
  legacy: boolean;
};

type PendingRestore = ParsedBackup & {
  fileName: string;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStats(value: unknown, maximum?: number): value is Stats {
  if (!isRecord(value)) return false;

  const keys: Array<keyof Stats> = [
    "hp",
    "attack",
    "defense",
    "specialAttack",
    "specialDefense",
    "speed",
  ];

  return keys.every((key) => {
    const stat = value[key];
    return (
      isFiniteNumber(stat) &&
      stat >= 0 &&
      (maximum === undefined || stat <= maximum)
    );
  });
}

function isPokemonBuild(value: unknown): value is PokemonBuild {
  if (!isRecord(value)) return false;

  const moves = value.moves;
  const trainingSystem = value.trainingSystem;
  const level = value.level;
  const ivs = value.ivs;

  return (
    typeof value.id === "string" &&
    typeof value.speciesId === "string" &&
    typeof value.ability === "string" &&
    typeof value.item === "string" &&
    typeof value.nature === "string" &&
    typeof value.teraType === "string" &&
    Array.isArray(moves) &&
    moves.length === 4 &&
    moves.every((move) => typeof move === "string") &&
    isStats(value.evs) &&
    (trainingSystem === undefined || trainingSystem === "traditional" || trainingSystem === "champions") &&
    (level === undefined || (isFiniteNumber(level) && level >= 1 && level <= 100)) &&
    (ivs === undefined || isStats(ivs, 31)) &&
    typeof value.memo === "string"
  );
}

function isParty(value: unknown): value is Party {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.concept === "string" &&
    typeof value.selectionNotes === "string" &&
    typeof value.difficultMatchups === "string" &&
    Array.isArray(value.members) &&
    value.members.every(isPokemonBuild)
  );
}

function isBattleLog(value: unknown): value is BattleLog {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.date === "string" &&
    (value.result === "勝ち" || value.result === "負け") &&
    typeof value.partyId === "string" &&
    typeof value.ownSelection === "string" &&
    typeof value.opponentTeam === "string" &&
    typeof value.memo === "string"
  );
}

function isAppState(value: unknown): value is AppState {
  if (!isRecord(value)) return false;

  return (
    Array.isArray(value.parties) &&
    value.parties.every(isParty) &&
    Array.isArray(value.battleLogs) &&
    value.battleLogs.every(isBattleLog)
  );
}

function readRecentItems(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_ITEMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function createBackupPayload(): BackupPayload {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appState: readStoredState(),
    preferences: {
      recentItems: readRecentItems(),
    },
  };
}

function formatFileTimestamp(date = new Date()): string {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "-",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ];
  return parts.join("");
}

function downloadBackup(prefix = "pokemon-battle-notebook-backup"): void {
  const payload = createBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${prefix}-${formatFileTimestamp()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseBackup(raw: unknown): ParsedBackup {
  if (isAppState(raw)) {
    return {
      appState: raw,
      exportedAt: null,
      recentItems: null,
      legacy: true,
    };
  }

  if (!isRecord(raw) || raw.format !== BACKUP_FORMAT) {
    throw new Error("Pokémon Battle Notebookのバックアップファイルではありません。");
  }

  if (raw.version !== BACKUP_VERSION) {
    throw new Error(`対応していないバックアップ形式です（version: ${String(raw.version)}）。`);
  }

  if (!isAppState(raw.appState)) {
    throw new Error("パーティまたは対戦履歴のデータ形式が正しくありません。");
  }

  let recentItems: string[] | null = null;
  if (raw.preferences !== undefined) {
    if (!isRecord(raw.preferences)) {
      throw new Error("設定データの形式が正しくありません。");
    }
    const items = raw.preferences.recentItems;
    if (!Array.isArray(items) || !items.every((item) => typeof item === "string")) {
      throw new Error("最近使った持ち物のデータ形式が正しくありません。");
    }
    recentItems = items;
  }

  return {
    appState: raw.appState,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : null,
    recentItems,
    legacy: false,
  };
}

function formatExportedAt(value: string | null): string {
  if (!value) return "日時情報なし";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function DataBackupManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentState = readStoredState();

  const handleExport = () => {
    try {
      downloadBackup();
      setStatus({ type: "success", text: "バックアップファイルを保存しました。" });
    } catch {
      setStatus({ type: "error", text: "バックアップファイルを作成できませんでした。" });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPendingRestore(null);
    setStatus(null);

    if (file.size > MAX_BACKUP_FILE_SIZE) {
      setStatus({
        type: "error",
        text: "ファイルが大きすぎます。10MB以下のバックアップを選択してください。",
      });
      return;
    }

    try {
      const parsedJson = JSON.parse(await file.text()) as unknown;
      const parsedBackup = parseBackup(parsedJson);
      setPendingRestore({ ...parsedBackup, fileName: file.name });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "バックアップファイルを読み込めませんでした。",
      });
    }
  };

  const handleRestore = () => {
    if (!pendingRestore) return;

    const confirmed = window.confirm(
      "現在のパーティと対戦履歴を、選択したバックアップの内容で置き換えます。続けますか？",
    );
    if (!confirmed) return;

    try {
      downloadBackup("pokemon-battle-notebook-before-restore");
      localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(pendingRestore.appState));

      if (pendingRestore.recentItems !== null) {
        localStorage.setItem(RECENT_ITEMS_STORAGE_KEY, JSON.stringify(pendingRestore.recentItems));
      }

      window.dispatchEvent(
        new CustomEvent<AppState>(APP_STATE_CHANGED_EVENT, {
          detail: pendingRestore.appState,
        }),
      );
      setStatus({
        type: "success",
        text: "復元しました。画面を再読み込みします。復元前のデータも自動保存しました。",
      });
      setTimeout(() => window.location.reload(), 500);
    } catch {
      setStatus({
        type: "error",
        text: "データを復元できませんでした。現在のデータは変更されていません。",
      });
    }
  };

  return (
    <>
      <button
        className="data-backup-launcher"
        type="button"
        onClick={() => {
          setIsOpen(true);
          setStatus(null);
        }}
      >
        データ管理
      </button>

      {isOpen && (
        <div
          className="data-backup-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            className="data-backup-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-backup-title"
          >
            <div className="data-backup-heading">
              <div>
                <p className="eyebrow">DATA MANAGEMENT</p>
                <h2 id="data-backup-title">バックアップ・復元</h2>
              </div>
              <button
                className="data-backup-close"
                type="button"
                aria-label="閉じる"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="data-backup-current-summary">
              <span>現在のデータ</span>
              <strong>{currentState.parties.length}パーティ</strong>
              <strong>{currentState.battleLogs.length}対戦</strong>
            </div>

            <div className="data-backup-section">
              <div>
                <h3>バックアップを書き出す</h3>
                <p>パーティ、育成内容、対戦履歴、最近使った持ち物をJSONファイルへ保存します。</p>
              </div>
              <button className="primary-button" type="button" onClick={handleExport}>
                JSONを保存
              </button>
            </div>

            <div className="data-backup-divider" />

            <div className="data-backup-section restore-section">
              <div>
                <h3>バックアップから復元する</h3>
                <p>ファイルを選んだだけでは上書きされません。内容を確認してから復元できます。</p>
              </div>
              <button
                className="secondary-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                JSONを選択
              </button>
              <input
                ref={fileInputRef}
                className="data-backup-file-input"
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
              />
            </div>

            {pendingRestore && (
              <div className="data-backup-preview">
                <div className="data-backup-preview-heading">
                  <div>
                    <span>選択したバックアップ</span>
                    <strong>{pendingRestore.fileName}</strong>
                  </div>
                  {pendingRestore.legacy && <span className="legacy-backup-badge">旧形式</span>}
                </div>
                <dl>
                  <div>
                    <dt>作成日時</dt>
                    <dd>{formatExportedAt(pendingRestore.exportedAt)}</dd>
                  </div>
                  <div>
                    <dt>パーティ</dt>
                    <dd>{pendingRestore.appState.parties.length}件</dd>
                  </div>
                  <div>
                    <dt>対戦履歴</dt>
                    <dd>{pendingRestore.appState.battleLogs.length}件</dd>
                  </div>
                </dl>
                <p className="data-backup-warning">
                  復元すると現在のデータを置き換えます。復元直前のデータは自動的にJSONで保存されます。
                </p>
                <div className="data-backup-preview-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setPendingRestore(null)}
                  >
                    選択を解除
                  </button>
                  <button className="primary-button" type="button" onClick={handleRestore}>
                    このデータで復元
                  </button>
                </div>
              </div>
            )}

            {status && (
              <p className={`data-backup-status ${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                {status.text}
              </p>
            )}

            <p className="data-backup-note">
              図鑑・技候補など再取得できるキャッシュは含みません。バックアップファイルには対戦メモが含まれるため、安全な場所に保管してください。
            </p>
          </section>
        </div>
      )}
    </>
  );
}
