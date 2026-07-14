import { useEffect, useState } from "react";
import { ALL_TYPES, POKEDEX } from "./data";
import type { PokemonEntry, PokemonType, Stats } from "./model";

const CSV_BASE_URLS = [
  "https://cdn.jsdelivr.net/gh/PokeAPI/pokeapi@master/data/v2/csv",
  "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv",
];

const CACHE_KEY = "pokemon-battle-notebook.pokedex.v1";
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const JAPANESE_LANGUAGE_ID = "1";
const ENGLISH_LANGUAGE_ID = "9";
const MINIMUM_NATIONAL_DEX_SIZE = 1000;
const TYPE_SET = new Set<string>(ALL_TYPES);

type CsvRecord = Record<string, string>;
type PokedexStatus = "loading" | "ready" | "fallback";

type PokedexCache = {
  savedAt: number;
  entries: PokemonEntry[];
};

type PokedexResult = {
  pokedex: PokemonEntry[];
  status: PokedexStatus;
  error: string | null;
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

function createEmptyStats(): Stats {
  return {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
}

function humanizeIdentifier(identifier: string): string {
  return identifier
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildNationalPokedex(tables: {
  species: CsvRecord[];
  speciesNames: CsvRecord[];
  pokemon: CsvRecord[];
  typeNames: CsvRecord[];
  pokemonTypes: CsvRecord[];
  abilities: CsvRecord[];
  abilityNames: CsvRecord[];
  pokemonAbilities: CsvRecord[];
  pokemonStats: CsvRecord[];
}): PokemonEntry[] {
  const speciesNames = new Map<string, { japanese?: string; english?: string }>();
  for (const row of tables.speciesNames) {
    if (row.local_language_id !== JAPANESE_LANGUAGE_ID && row.local_language_id !== ENGLISH_LANGUAGE_ID) {
      continue;
    }
    const current = speciesNames.get(row.pokemon_species_id) ?? {};
    if (row.local_language_id === JAPANESE_LANGUAGE_ID) current.japanese = row.name;
    if (row.local_language_id === ENGLISH_LANGUAGE_ID) current.english = row.name;
    speciesNames.set(row.pokemon_species_id, current);
  }

  const defaultPokemonBySpecies = new Map<string, CsvRecord>();
  for (const row of tables.pokemon) {
    if (row.is_default === "1") defaultPokemonBySpecies.set(row.species_id, row);
  }

  const typeNames = new Map<string, PokemonType>();
  for (const row of tables.typeNames) {
    if (row.local_language_id !== JAPANESE_LANGUAGE_ID || !TYPE_SET.has(row.name)) continue;
    typeNames.set(row.type_id, row.name as PokemonType);
  }

  const typesByPokemon = new Map<string, { slot: number; type: PokemonType }[]>();
  for (const row of tables.pokemonTypes) {
    const type = typeNames.get(row.type_id);
    if (!type) continue;
    const current = typesByPokemon.get(row.pokemon_id) ?? [];
    current.push({ slot: Number(row.slot), type });
    typesByPokemon.set(row.pokemon_id, current);
  }

  const abilityIdentifiers = new Map(tables.abilities.map((row) => [row.id, row.identifier]));
  const japaneseAbilityNames = new Map<string, string>();
  for (const row of tables.abilityNames) {
    if (row.local_language_id === JAPANESE_LANGUAGE_ID) {
      japaneseAbilityNames.set(row.ability_id, row.name);
    }
  }

  const abilitiesByPokemon = new Map<string, { slot: number; name: string }[]>();
  for (const row of tables.pokemonAbilities) {
    const identifier = abilityIdentifiers.get(row.ability_id) ?? "";
    const name = japaneseAbilityNames.get(row.ability_id) ?? humanizeIdentifier(identifier);
    if (!name) continue;
    const current = abilitiesByPokemon.get(row.pokemon_id) ?? [];
    current.push({ slot: Number(row.slot), name });
    abilitiesByPokemon.set(row.pokemon_id, current);
  }

  const statsByPokemon = new Map<string, Stats>();
  for (const row of tables.pokemonStats) {
    const stats = statsByPokemon.get(row.pokemon_id) ?? createEmptyStats();
    const value = Number(row.base_stat);
    if (row.stat_id === "1") stats.hp = value;
    if (row.stat_id === "2") stats.attack = value;
    if (row.stat_id === "3") stats.defense = value;
    if (row.stat_id === "4") stats.specialAttack = value;
    if (row.stat_id === "5") stats.specialDefense = value;
    if (row.stat_id === "6") stats.speed = value;
    statsByPokemon.set(row.pokemon_id, stats);
  }

  const entries = tables.species
    .map((species): PokemonEntry | null => {
      const pokemon = defaultPokemonBySpecies.get(species.id);
      const names = speciesNames.get(species.id);
      if (!pokemon || !names?.japanese || !names.english) return null;

      const types = (typesByPokemon.get(pokemon.id) ?? [])
        .sort((left, right) => left.slot - right.slot)
        .map((item) => item.type);
      const abilities = (abilitiesByPokemon.get(pokemon.id) ?? [])
        .sort((left, right) => left.slot - right.slot)
        .map((item) => item.name);
      const stats = statsByPokemon.get(pokemon.id);
      if (types.length === 0 || !stats) return null;

      return {
        id: species.identifier,
        number: Number(species.id),
        name: names.japanese,
        englishName: names.english,
        types,
        abilities,
        stats,
      };
    })
    .filter((entry): entry is PokemonEntry => entry !== null);

  const byNumber = new Map(entries.map((entry) => [entry.number, entry]));
  for (const curatedEntry of POKEDEX) {
    byNumber.set(curatedEntry.number, curatedEntry);
  }

  return [...byNumber.values()].sort((left, right) => left.number - right.number);
}

async function loadNationalPokedex(signal: AbortSignal): Promise<PokemonEntry[]> {
  const [species, speciesNames, pokemon, typeNames, pokemonTypes, abilities, abilityNames, pokemonAbilities, pokemonStats] =
    await Promise.all([
      fetchCsv("pokemon_species.csv", signal),
      fetchCsv("pokemon_species_names.csv", signal),
      fetchCsv("pokemon.csv", signal),
      fetchCsv("type_names.csv", signal),
      fetchCsv("pokemon_types.csv", signal),
      fetchCsv("abilities.csv", signal),
      fetchCsv("ability_names.csv", signal),
      fetchCsv("pokemon_abilities.csv", signal),
      fetchCsv("pokemon_stats.csv", signal),
    ]);

  const entries = buildNationalPokedex({
    species,
    speciesNames,
    pokemon,
    typeNames,
    pokemonTypes,
    abilities,
    abilityNames,
    pokemonAbilities,
    pokemonStats,
  });

  if (entries.length < MINIMUM_NATIONAL_DEX_SIZE) {
    throw new Error(`全国図鑑データが不足しています（${entries.length}匹）。`);
  }

  return entries;
}

function readCache(): PokedexCache | null {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<PokedexCache>;
    if (
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > CACHE_MAX_AGE ||
      !Array.isArray(parsed.entries) ||
      parsed.entries.length < MINIMUM_NATIONAL_DEX_SIZE
    ) {
      return null;
    }
    return { savedAt: parsed.savedAt, entries: parsed.entries as PokemonEntry[] };
  } catch {
    return null;
  }
}

function writeCache(entries: PokemonEntry[]): void {
  try {
    const cache: PokedexCache = { savedAt: Date.now(), entries };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // The app can continue with in-memory data when storage is unavailable.
  }
}

export function usePokedex(): PokedexResult {
  const [cached] = useState<PokedexCache | null>(() => readCache());
  const [pokedex, setPokedex] = useState<PokemonEntry[]>(cached?.entries ?? POKEDEX);
  const [status, setStatus] = useState<PokedexStatus>(cached ? "ready" : "loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) return;

    const controller = new AbortController();
    void loadNationalPokedex(controller.signal)
      .then((entries) => {
        setPokedex(entries);
        setStatus("ready");
        writeCache(entries);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("fallback");
        setError(loadError instanceof Error ? loadError.message : "全国図鑑データを取得できませんでした。");
      });

    return () => controller.abort();
  }, [cached]);

  return { pokedex, status, error };
}
