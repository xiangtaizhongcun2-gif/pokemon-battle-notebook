import { useEffect, useMemo, useState } from "react";

const RECENT_ITEMS_STORAGE_KEY = "pokemon-battle-notebook.recent-items.v1";
const RECENT_ITEMS_CHANGED_EVENT = "pokemon-battle-notebook:recent-items-changed";
const MAX_RECENT_ITEMS = 20;

export const PINNED_ITEM_OPTIONS = [
  "オボンのみ",
  "たべのこし",
  "こだわりスカーフ",
  "きあいのタスキ",
] as const;

function uniqueItems(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawItem of items) {
    const item = rawItem.trim();
    if (!item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }

  return result;
}

function readRecentItems(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_ITEMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return uniqueItems(
      parsed.filter((value): value is string => typeof value === "string"),
    ).slice(0, MAX_RECENT_ITEMS);
  } catch {
    return [];
  }
}

function writeRecentItems(items: string[]): void {
  try {
    localStorage.setItem(RECENT_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 履歴を保存できない環境でも、持ち物の入力自体は継続できます。
  }
}

export function rememberRecentItem(rawItem: string): void {
  const item = rawItem.trim();
  if (!item) return;

  const nextItems = uniqueItems([
    item,
    ...readRecentItems().filter((recentItem) => recentItem !== item),
  ]).slice(0, MAX_RECENT_ITEMS);

  writeRecentItems(nextItems);
  window.dispatchEvent(
    new CustomEvent<string[]>(RECENT_ITEMS_CHANGED_EVENT, { detail: nextItems }),
  );
}

function prioritizeItemOptions(allItems: string[], recentItems: string[]): string[] {
  const pinnedSet = new Set<string>(PINNED_ITEM_OPTIONS);
  const recentWithoutPinned = recentItems.filter((item) => !pinnedSet.has(item));
  const prioritized = uniqueItems([
    ...PINNED_ITEM_OPTIONS,
    ...recentWithoutPinned,
    ...allItems,
  ]);

  return prioritized;
}

export function usePrioritizedItemOptions(allItems: string[]): {
  itemOptions: string[];
  rememberItem: (item: string) => void;
} {
  const [recentItems, setRecentItems] = useState<string[]>(() => readRecentItems());

  useEffect(() => {
    const handleRecentItemsChanged = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      setRecentItems(Array.isArray(detail) ? detail : readRecentItems());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === RECENT_ITEMS_STORAGE_KEY) {
        setRecentItems(readRecentItems());
      }
    };

    window.addEventListener(RECENT_ITEMS_CHANGED_EVENT, handleRecentItemsChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(RECENT_ITEMS_CHANGED_EVENT, handleRecentItemsChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const itemOptions = useMemo(
    () => prioritizeItemOptions(allItems, recentItems),
    [allItems, recentItems],
  );

  return { itemOptions, rememberItem: rememberRecentItem };
}
