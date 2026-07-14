import { useEffect, useState } from "react";
import type { PokemonType } from "./model";

const CSV_BASE_URLS = [
  "https://cdn.jsdelivr.net/gh/PokeAPI/pokeapi@master/data/v2/csv",
  "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv",
];
const CACHE_KEY = "pokemon-battle-notebook.move-type-catalog.v3";
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const JAPANESE_LANGUAGE_ID = "1";

type CsvRecord = Record<string, string>;
export type MoveCategory = "physical" | "special" | "status";
export type MoveMetadata = {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
};
export type MoveCatalogStatus = "loading" | "ready" | "fallback";

type StoredMoveCatalog = {
  savedAt: number;
  moves: Record<string, MoveMetadata>;
};

const TYPE_BY_ID: Record<string, PokemonType> = {
  "1": "ノーマル", "2": "かくとう", "3": "ひこう", "4": "どく", "5": "じめん",
  "6": "いわ", "7": "むし", "8": "ゴースト", "9": "はがね", "10": "ほのお",
  "11": "みず", "12": "くさ", "13": "でんき", "14": "エスパー", "15": "こおり",
  "16": "ドラゴン", "17": "あく", "18": "フェアリー",
};

const CATEGORY_BY_ID: Record<string, MoveCategory> = {
  "1": "status",
  "2": "physical",
  "3": "special",
};

function fallback(name: string, type: PokemonType, category: MoveCategory, power: number | null): MoveMetadata {
  return { name, type, category, power };
}

const FALLBACK_MOVES: Record<string, MoveMetadata> = {
  じしん: fallback("じしん", "じめん", "physical", 100),
  しんそく: fallback("しんそく", "ノーマル", "physical", 80),
  アイアンヘッド: fallback("アイアンヘッド", "はがね", "physical", 80),
  ふいうち: fallback("ふいうち", "あく", "physical", 70),
  インファイト: fallback("インファイト", "かくとう", "physical", 120),
  とんぼがえり: fallback("とんぼがえり", "むし", "physical", 70),
  フレアドライブ: fallback("フレアドライブ", "ほのお", "physical", 120),
  じゃれつく: fallback("じゃれつく", "フェアリー", "physical", 90),
  かえんほうしゃ: fallback("かえんほうしゃ", "ほのお", "special", 90),
  ハイドロポンプ: fallback("ハイドロポンプ", "みず", "special", 110),
  れいとうビーム: fallback("れいとうビーム", "こおり", "special", 90),
  りゅうせいぐん: fallback("りゅうせいぐん", "ドラゴン", "special", 130),
  シャドーボール: fallback("シャドーボール", "ゴースト", "special", 80),
  ムーンフォース: fallback("ムーンフォース", "フェアリー", "special", 95),
  テラバースト: fallback("テラバースト", "ノーマル", "special", 80),
  まもる: fallback("まもる", "ノーマル", "status", 0),
  りゅうのまい: fallback("りゅうのまい", "ドラゴン", "status", 0),
  つるぎのまい: fallback("つるぎのまい", "ノーマル", "status", 0),
  ステルスロック: fallback("ステルスロック", "いわ", "status", 0),
};

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

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

function readStoredCatalog(): StoredMoveCatalog | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredMoveCatalog>;
    if (
      typeof parsed.savedAt !== "number" ||
      !parsed.moves ||
      typeof parsed.moves !== "object" ||
      Object.keys(parsed.moves).length < 500
    ) {
      return null;
    }
    return parsed as StoredMoveCatalog;
  } catch {
    return null;
  }
}

function writeStoredCatalog(catalog: StoredMoveCatalog): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
  } catch {
    // The app can continue with the in-memory catalog.
  }
}

async function loadMoveCatalog(signal: AbortSignal): Promise<StoredMoveCatalog> {
  const [moveNames, moves] = await Promise.all([
    fetchCsv("move_names.csv", signal),
    fetchCsv("moves.csv", signal),
  ]);

  const namesById = new Map<string, string>();
  moveNames.forEach((row) => {
    if (row.local_language_id === JAPANESE_LANGUAGE_ID && row.name) {
      namesById.set(row.move_id, row.name);
    }
  });

  const metadata: Record<string, MoveMetadata> = {};
  moves.forEach((row) => {
    const name = namesById.get(row.id);
    const type = TYPE_BY_ID[row.type_id];
    const category = CATEGORY_BY_ID[row.damage_class_id];
    if (!name || !type || !category) return;
    const parsedPower = Number(row.power);
    metadata[normalize(name)] = {
      name,
      type,
      category,
      power: category === "status" ? 0 : row.power && Number.isFinite(parsedPower) ? parsedPower : null,
    };
  });

  if (Object.keys(metadata).length < 500) {
    throw new Error("技データが不足しています。");
  }

  return { savedAt: Date.now(), moves: metadata };
}

export function findMoveMetadata(
  moves: Record<string, MoveMetadata>,
  moveName: string,
): MoveMetadata | undefined {
  return moves[normalize(moveName)];
}

export function useMoveTypeCatalog(): {
  moves: Record<string, MoveMetadata>;
  status: MoveCatalogStatus;
} {
  const storedCatalog = readStoredCatalog();
  const [moves, setMoves] = useState<Record<string, MoveMetadata>>(
    storedCatalog?.moves ?? FALLBACK_MOVES,
  );
  const [status, setStatus] = useState<MoveCatalogStatus>(storedCatalog ? "ready" : "loading");

  useEffect(() => {
    if (storedCatalog && Date.now() - storedCatalog.savedAt <= CACHE_MAX_AGE) return;

    const controller = new AbortController();
    void loadMoveCatalog(controller.signal)
      .then((catalog) => {
        setMoves(catalog.moves);
        setStatus("ready");
        writeStoredCatalog(catalog);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setMoves(storedCatalog?.moves ?? FALLBACK_MOVES);
        setStatus("fallback");
      });

    return () => controller.abort();
  }, []);

  return { moves, status };
}
