import type { AppState } from "./model";
import {
  APP_STATE_CHANGED_EVENT,
  APP_STATE_STORAGE_KEY,
} from "./storage";

const DEVICE_ID_STORAGE_KEY = "pokemon-battle-notebook.cloud-device.v1";
const LAST_SYNC_HASH_PREFIX = "pokemon-battle-notebook.cloud-hash.v1.";
const RECENT_ITEMS_STORAGE_KEY = "pokemon-battle-notebook.recent-items.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeCloudState(value: unknown): AppState | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.parties) || !Array.isArray(value.battleLogs)) return null;

  const buildTemplates = Array.isArray(value.buildTemplates)
    ? value.buildTemplates
    : [];

  return {
    parties: value.parties as AppState["parties"],
    battleLogs: value.battleLogs as AppState["battleLogs"],
    buildTemplates: buildTemplates as NonNullable<AppState["buildTemplates"]>,
  };
}

export function serializeAppState(state: AppState): string {
  return JSON.stringify(state);
}

export function hashAppState(serialized: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getDeviceId(): string {
  const stored = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (stored) return stored;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  return id;
}

export function getLastSyncedHash(uid: string): string | null {
  return localStorage.getItem(`${LAST_SYNC_HASH_PREFIX}${uid}`);
}

export function setLastSyncedHash(uid: string, hash: string): void {
  localStorage.setItem(`${LAST_SYNC_HASH_PREFIX}${uid}`, hash);
}

export function applyCloudState(state: AppState): void {
  localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent<AppState>(APP_STATE_CHANGED_EVENT, { detail: state }),
  );
}

function readRecentItems(): string[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(RECENT_ITEMS_STORAGE_KEY) ?? "[]",
    ) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function formatTimestamp(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "-",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join("");
}

export function downloadPreSyncBackup(state: AppState): void {
  const payload = {
    format: "pokemon-battle-notebook-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    appState: state,
    preferences: { recentItems: readRecentItems() },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `before-cloud-sync-${formatTimestamp()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
