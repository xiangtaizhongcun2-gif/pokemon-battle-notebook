import { useEffect, useState } from "react";

const CSV_BASE_URLS = [
  "https://cdn.jsdelivr.net/gh/PokeAPI/pokeapi@master/data/v2/csv",
  "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv",
];
const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon";
const CATALOG_CACHE_KEY = "pokemon-battle-notebook.suggestions.catalog.v1";
const MOVE_CACHE_PREFIX = "pokemon-battle-notebook.suggestions.moves.v1.";
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const JAPANESE_LANGUAGE_ID = "1";
const HOLDABLE_ITEM_FLAG_ID = "5";

const FALLBACK_ITEMS = [
  "いのちのたま",
  "オボンのみ",
  "おんみつマント",
  "きあいのタスキ",
  "クリアチャーム",
  "こだわりスカーフ",
  "こだわりハチマキ",
  "こだわりメガネ",
  "ゴツゴツメット",
  "じゃくてんほけん",
  "たべのこし",
  "とつげきチョッキ",
  "ひかりのねんど",
  "ブーストエナジー",
  "ラムのみ",
];

type CsvRecord = Record<string, string>;
type SuggestionStatus = "loading" | "ready" | "fallback";
type MoveSource = "loading" | "pokemon" | "all" | "none";

type SuggestionCatalog = {
  savedAt: number;
  moveNamesById: Record<string, string>;
  allMoves: string[];
  items: string[];
};

type PokemonApiResponse = {
  moves?: Array<{
    move?: {
      name?: string;
      url?: string;
    };
  }>;
};

function parseCsv(text: string): CsvRecord[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [rawHeaders, ...dataRows] = rows;
  if (!rawHeaders) return [];
  const headers = rawHeaders.map((header) => header.replace(/^\uFEFF/, ""));

  return dataRows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

async function fetchCsv(path: string, signal: AbortSignal): Promise<CsvRecord[]> {
  let lastError: unknown;

  for (const baseUrl of CSV_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}/${path}`, { signal });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      return parseCsv(await response.text());
    } catch (error) {
      if (signal.aborted) throw error;
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${path}の取得に失敗しました。`);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right, "ja"));
}

function humanizeIdentifier(identifier: string): string {
  return identifier
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractResourceId(url: string): string {
  return url.split("/").filter(Boolean).at(-1) ?? "";
}

function readCatalog(): SuggestionCatalog | null {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SuggestionCatalog>;
    if (
      typeof parsed.savedAt !== "number" ||
      !parsed.moveNamesById ||
      !Array.isArray(parsed.allMoves) ||
      !Array.isArray(parsed.items) ||
      parsed.allMoves.length < 500 ||
      parsed.items.length < 100
    ) {
      return null;
    }
    return parsed as SuggestionCatalog;
  } catch {
    return null;
  }
}

function writeCatalog(catalog: SuggestionCatalog): void {
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(catalog));
  } catch {
    // The app can continue with the in-memory catalog.
  }
}

function isCatalogFresh(catalog: SuggestionCatalog): boolean {
  return Date.now() - catalog.savedAt <= CACHE_MAX_AGE;
}

function moveCacheKey(speciesId: string): string {
  return `${MOVE_CACHE_PREFIX}${speciesId}`;
}

function readPokemonMoves(speciesId: string): string[] | null {
  try {
    const raw = localStorage.getItem(moveCacheKey(speciesId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const moves = parsed.filter((value): value is string => typeof value === "string" && value.length > 0);
    return moves.length > 0 ? moves : null;
  } catch {
    return null;
  }
}

function writePokemonMoves(speciesId: string, moves: string[]): void {
  try {
    localStorage.setItem(moveCacheKey(speciesId), JSON.stringify(moves));
  } catch {
    // Per-Pokémon suggestions are optional; free input remains available.
  }
}

async function loadCatalog(signal: AbortSignal): Promise<SuggestionCatalog> {
  const [moveNames, itemNames, itemFlagMap] = await Promise.all([
    fetchCsv("move_names.csv", signal),
    fetchCsv("item_names.csv", signal),
    fetchCsv("item_flag_map.csv", signal),
  ]);

  const moveNamesById: Record<string, string> = {};
  for (const row of moveNames) {
    if (row.local_language_id === JAPANESE_LANGUAGE_ID && row.name) {
      moveNamesById[row.move_id] = row.name;
    }
  }

  const holdableItemIds = new Set(
    itemFlagMap
      .filter((row) => row.item_flag_id === HOLDABLE_ITEM_FLAG_ID)
      .map((row) => row.item_id),
  );
  const items = uniqueSorted(
    itemNames
      .filter(
        (row) =>
          row.local_language_id === JAPANESE_LANGUAGE_ID &&
          holdableItemIds.has(row.item_id) &&
          Boolean(row.name),
      )
      .map((row) => row.name),
  );
  const allMoves = uniqueSorted(Object.values(moveNamesById));

  if (allMoves.length < 500 || items.length < 100) {
    throw new Error("技または持ち物の候補データが不足しています。");
  }

  return {
    savedAt: Date.now(),
    moveNamesById,
    allMoves,
    items,
  };
}

async function loadPokemonMoves(
  speciesId: string,
  catalog: SuggestionCatalog,
  signal: AbortSignal,
): Promise<string[]> {
  const response = await fetch(`${POKEMON_API_URL}/${encodeURIComponent(speciesId)}`, { signal });
  if (!response.ok) throw new Error(`${speciesId}: HTTP ${response.status}`);

  const data = (await response.json()) as PokemonApiResponse;
  const moves = uniqueSorted(
    (data.moves ?? []).map(({ move }) => {
      const resourceId = extractResourceId(move?.url ?? "");
      return catalog.moveNamesById[resourceId] ?? humanizeIdentifier(move?.name ?? "");
    }),
  );

  if (moves.length === 0) throw new Error(`${speciesId}の技候補が見つかりませんでした。`);
  return moves;
}

export function useBuildSuggestions(speciesId: string): {
  moveOptions: string[];
  itemOptions: string[];
  status: SuggestionStatus;
  statusText: string;
} {
  const initialCatalog = readCatalog();
  const initialMoves = readPokemonMoves(speciesId);
  const [catalog, setCatalog] = useState<SuggestionCatalog | null>(initialCatalog);
  const [catalogStatus, setCatalogStatus] = useState<SuggestionStatus>(
    initialCatalog ? "ready" : "loading",
  );
  const [moveOptions, setMoveOptions] = useState<string[]>(initialMoves ?? initialCatalog?.allMoves ?? []);
  const [moveSource, setMoveSource] = useState<MoveSource>(
    initialMoves ? "pokemon" : initialCatalog ? "all" : "loading",
  );

  useEffect(() => {
    if (initialCatalog && isCatalogFresh(initialCatalog)) return;

    const controller = new AbortController();
    void loadCatalog(controller.signal)
      .then((loadedCatalog) => {
        setCatalog(loadedCatalog);
        setCatalogStatus("ready");
        writeCatalog(loadedCatalog);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCatalogStatus("fallback");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cachedMoves = readPokemonMoves(speciesId);
    if (cachedMoves) {
      setMoveOptions(cachedMoves);
      setMoveSource("pokemon");
      return;
    }

    if (!catalog) {
      setMoveOptions([]);
      setMoveSource("loading");
      return;
    }

    setMoveOptions(catalog.allMoves);
    setMoveSource("loading");

    const controller = new AbortController();
    void loadPokemonMoves(speciesId, catalog, controller.signal)
      .then((moves) => {
        setMoveOptions(moves);
        setMoveSource("pokemon");
        writePokemonMoves(speciesId, moves);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setMoveOptions(catalog.allMoves);
        setMoveSource("all");
      });

    return () => controller.abort();
  }, [catalog, speciesId]);

  const itemOptions = catalog?.items ?? FALLBACK_ITEMS;
  const status: SuggestionStatus =
    catalogStatus === "loading" || moveSource === "loading"
      ? "loading"
      : catalogStatus === "fallback" || moveSource === "all" || moveSource === "none"
        ? "fallback"
        : "ready";

  let statusText = "このポケモンが覚えられる技と、持たせられる道具を候補表示しています。";
  if (status === "loading") {
    statusText = "技・持ち物の候補を読み込み中です。入力はそのまま続けられます。";
  } else if (moveSource === "all") {
    statusText = "ポケモン別の技候補を取得できないため、全技から候補を表示しています。";
  } else if (catalogStatus === "fallback") {
    statusText = "オフラインのため保存済み候補を表示しています。候補外の内容も入力できます。";
  }

  return { moveOptions, itemOptions, status, statusText };
}
