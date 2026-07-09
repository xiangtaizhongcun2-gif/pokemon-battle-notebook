# Data Model

## Overview

Pokémon Battle Notebook のデータモデルは、特定の作品や世代に依存しない設計にする。

このアプリの中心は「ポケモンごとの知識ページ」である。

そのため、Party や BattleLog が中心ではなく、Pokemon を中心に以下の情報がつながる構造にする。

```text
Pokemon
├── Types
├── Weaknesses
├── Resistances
├── Battle Mechanics
├── Personal Notes
├── Parties
├── Battle Logs
├── Research Notes
├── Damage Notes
├── Tags
└── Statistics
```

---

## Design Goals

データモデルの目標は以下である。

* ポケモンごとに情報を集約できること
* どの作品でも使えること
* メガシンカ、Zワザ、ダイマックス、テラスタルなどを柔軟に扱えること
* 将来の新作や新ギミックにも対応しやすいこと
* LocalStorage から Supabase などのクラウド保存へ移行しやすいこと
* UI とロジックを分離できること
* 型安全に扱えること
* 検索・タグ・統計に対応しやすいこと

---

## Core Concept

このアプリでは、すべての主要データは `id` を持つ。

各データは直接オブジェクトを埋め込みすぎず、基本的には `id` で関連づける。

例:

```text
Party
└── pokemonIds: PokemonBuildId[]

BattleLog
└── linkedPokemonIds: PokemonId[]

ResearchNote
└── linkedPokemonIds: PokemonId[]
```

こうすることで、後から検索・集計・バックリンク・クラウド同期を実装しやすくする。

---

## ID Policy

すべての主要モデルは文字列 ID を持つ。

```ts
type ID = string;
```

ID の例:

```ts
type GameId = string;
type PokemonSpeciesId = string;
type PokemonBuildId = string;
type PartyId = string;
type BattleLogId = string;
type ResearchNoteId = string;
type DamageNoteId = string;
type TagId = string;
```

初期実装では `crypto.randomUUID()` を使用してよい。

---

## Base Entity

多くのモデルで共通する項目。

```ts
type BaseEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};
```

日時は ISO 8601 形式の文字列で保存する。

例:

```ts
"2026-07-09T10:00:00.000Z"
```

---

## Game

作品を表すモデル。

特定の作品専用設計にしないため、Game を独立したモデルとして扱う。

```ts
type Game = BaseEntity & {
  name: string;
  shortName?: string;
  generation?: number;
  releaseOrder?: number;
  notes?: string;
  isCustom?: boolean;
};
```

例:

```ts
const gameExample: Game = {
  id: "game-scarlet-violet",
  name: "Pokémon Scarlet / Violet",
  shortName: "SV",
  generation: 9,
  releaseOrder: 9,
  notes: "",
  isCustom: false,
  createdAt: "2026-07-09T10:00:00.000Z",
  updatedAt: "2026-07-09T10:00:00.000Z"
};
```

---

## RuleSet

対戦ルールを表す。

```ts
type RuleSet = BaseEntity & {
  name: string;
  description?: string;
  gameIds?: GameId[];
  isCustom?: boolean;
};
```

例:

* Single Battle
* Double Battle
* VGC
* 6v6
* 6→3
* Flat Battle
* Custom

---

## Season

シーズンやレギュレーションを表す。

```ts
type Season = BaseEntity & {
  name: string;
  gameId?: GameId;
  ruleSetId?: RuleSetId;
  regulationName?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
};
```

---

## Pokémon Type

タイプを表す。

タイプ相性計算に使うため、文字列 union で扱う。

将来の作品やカスタムルールに対応するため、`Custom` も許可する。

```ts
type PokemonType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Electric"
  | "Grass"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Dark"
  | "Steel"
  | "Fairy"
  | "Stellar"
  | "Custom";
```

---

## Type Matchup

ポケモン詳細ページで弱点・耐性・無効をすぐ表示するためのモデル。

```ts
type TypeEffectiveness = {
  type: PokemonType;
  multiplier: number;
};
```

例:

```ts
const garchompMatchup: TypeEffectiveness[] = [
  { type: "Ice", multiplier: 4 },
  { type: "Dragon", multiplier: 2 },
  { type: "Fairy", multiplier: 2 },
  { type: "Electric", multiplier: 0 },
  { type: "Fire", multiplier: 0.5 },
  { type: "Poison", multiplier: 0.5 },
  { type: "Rock", multiplier: 0.5 }
];
```

UI では倍率ごとに分類して表示する。

```text
Weaknesses
×4 Ice
×2 Dragon / Fairy

Resistances
×0.5 Fire / Poison / Rock

Immunities
×0 Electric
```

---

## Type Chart

タイプ相性表は、作品や世代ごとに変わる可能性がある。

そのため、タイプ相性は固定値として UI に直接書かず、TypeChart として管理する。

```ts
type TypeChart = BaseEntity & {
  name: string;
  gameIds?: GameId[];
  generation?: number;
  matchups: TypeChartEntry[];
};
```

```ts
type TypeChartEntry = {
  attackType: PokemonType;
  defenseType: PokemonType;
  multiplier: number;
};
```

ポケモンのタイプから弱点を計算する関数を別途 `utils/typeEffectiveness.ts` に置く。

---

## PokemonSpecies

ポケモンそのものを表す基本データ。

これは公式図鑑的な情報に近い。

ユーザーのメモや構築情報はここには直接入れすぎない。

```ts
type PokemonSpecies = BaseEntity & {
  nationalDexNumber?: number;
  name: string;
  formName?: string;
  types: PokemonType[];
  baseStats?: BaseStats;
  abilities?: string[];
  hiddenAbility?: string;
  availableGameIds?: GameId[];
  notes?: string;
};
```

---

## BaseStats

種族値。

```ts
type BaseStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};
```

---

## PokemonKnowledgePage

このアプリの中心となる「ポケモンごとの知識ページ」。

PokemonSpecies に対して、ユーザーが蓄積する情報を表す。

```ts
type PokemonKnowledgePage = BaseEntity & {
  speciesId: PokemonSpeciesId;
  title: string;
  summary?: string;
  importantMemo?: string;
  personalNotes?: string;
  roleTagIds: TagId[];
  linkedPartyIds: PartyId[];
  linkedBattleLogIds: BattleLogId[];
  linkedResearchNoteIds: ResearchNoteId[];
  linkedDamageNoteIds: DamageNoteId[];
  favorite?: boolean;
};
```

### Purpose

このモデルは「自分だけの図鑑ページ」を表す。

同じポケモンでも、ユーザーごとに内容が変わる。

---

## PokemonBuild

パーティ内の1匹を表す。

同じポケモンでも、型が違えば別の PokemonBuild として扱う。

```ts
type PokemonBuild = BaseEntity & {
  speciesId: PokemonSpeciesId;
  nickname?: string;
  formName?: string;
  level?: number;
  gender?: "Male" | "Female" | "Genderless" | "Unknown";
  nature?: string;
  ability?: string;
  item?: string;
  typesOverride?: PokemonType[];
  teraType?: PokemonType;
  moves: MoveSlot[];
  evs?: StatSpread;
  ivs?: StatSpread;
  actualStats?: StatSpread;
  battleMechanics: BattleMechanic[];
  roleTagIds: TagId[];
  memo?: string;
};
```

### Notes

* `speciesId` は基本となるポケモンを指す。
* `typesOverride` は特殊なフォルムやカスタムルール用。
* `teraType` は Terastal 用の簡易項目として持ってもよいが、正式には BattleMechanic でも表現できる。
* 技、努力値、持ち物、特性などは PokemonBuild に持たせる。

---

## MoveSlot

技を表す。

```ts
type MoveSlot = {
  name: string;
  type?: PokemonType;
  category?: "Physical" | "Special" | "Status" | "Unknown";
  notes?: string;
};
```

---

## StatSpread

努力値、個体値、実数値に使う。

```ts
type StatSpread = {
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
};
```

---

## BattleMechanic

メガシンカ、Zワザ、ダイマックス、テラスタルなどを共通化するモデル。

このアプリでは、世代固有の要素を直接固定しすぎない。

```ts
type BattleMechanicType =
  | "MegaEvolution"
  | "ZMove"
  | "Dynamax"
  | "Gigantamax"
  | "Terastal"
  | "UltraBurst"
  | "Custom";
```

```ts
type BattleMechanic = {
  id: string;
  type: BattleMechanicType;
  name: string;
  details: BattleMechanicDetail[];
  notes?: string;
};
```

```ts
type BattleMechanicDetail = {
  key: string;
  label: string;
  value: string;
};
```

### Examples

#### Terastal

```ts
const terastalExample: BattleMechanic = {
  id: "mechanic-1",
  type: "Terastal",
  name: "Terastal",
  details: [
    {
      key: "teraType",
      label: "Tera Type",
      value: "Steel"
    }
  ],
  notes: "Used defensively against Fairy and Ice."
};
```

#### Mega Evolution

```ts
const megaExample: BattleMechanic = {
  id: "mechanic-2",
  type: "MegaEvolution",
  name: "Mega Evolution",
  details: [
    {
      key: "megaStone",
      label: "Mega Stone",
      value: "Garchompite"
    }
  ],
  notes: ""
};
```

#### Custom

```ts
const customExample: BattleMechanic = {
  id: "mechanic-3",
  type: "Custom",
  name: "Future Mechanic",
  details: [
    {
      key: "customField",
      label: "Custom Field",
      value: "Custom Value"
    }
  ],
  notes: "For future games or house rules."
};
```

---

## Party

パーティを表す。

```ts
type Party = BaseEntity & {
  name: string;
  gameId?: GameId;
  ruleSetId?: RuleSetId;
  seasonId?: SeasonId;
  concept?: string;
  pokemonBuildIds: PokemonBuildId[];
  tagIds: TagId[];
  notes?: string;
  favorite?: boolean;
  archived?: boolean;
};
```

### Requirements

* 最大6匹を基本とするが、カスタムルールに対応できるように完全固定はしない。
* Party は PokemonSpecies ではなく PokemonBuild を持つ。
* 同じポケモンでも型が違えば別 PokemonBuild として扱う。

---

## Team Weakness Summary

パーティ全体の弱点分析に使う。

```ts
type TeamWeaknessSummary = {
  attackType: PokemonType;
  weakCount: number;
  resistCount: number;
  immuneCount: number;
  neutralCount: number;
  riskLevel: "Low" | "Medium" | "High";
};
```

これは保存データではなく、Party と PokemonBuild から計算してよい。

---

## BattleLog

対戦記録。

```ts
type BattleResult = "Win" | "Loss" | "Draw" | "Unknown";
```

```ts
type BattleLog = BaseEntity & {
  date: string;
  gameId?: GameId;
  ruleSetId?: RuleSetId;
  seasonId?: SeasonId;
  opponentName?: string;
  result: BattleResult;
  usedPartyId?: PartyId;
  opponentPokemonSpeciesIds: PokemonSpeciesId[];
  selectedPokemonBuildIds: PokemonBuildId[];
  opponentSelectedPokemonSpeciesIds?: PokemonSpeciesId[];
  mvpPokemonId?: PokemonSpeciesId;
  mistakePokemonIds?: PokemonSpeciesId[];
  linkedPokemonIds: PokemonSpeciesId[];
  tagIds: TagId[];
  memo?: string;
  reflection?: string;
  improvement?: string;
};
```

### Notes

BattleLog は、対戦に関係したポケモンへリンクされる。

これにより、ポケモン詳細ページから関連する対戦ログを表示できる。

---

## SelectionMemo

選出メモ。

相手構築に対して、どのように選出するかを記録する。

```ts
type SelectionMemo = BaseEntity & {
  title: string;
  gameId?: GameId;
  ruleSetId?: RuleSetId;
  seasonId?: SeasonId;
  partyId?: PartyId;
  opponentArchetype?: string;
  opponentPokemonSpeciesIds: PokemonSpeciesId[];
  selectedPokemonBuildIds: PokemonBuildId[];
  leadPokemonBuildId?: PokemonBuildId;
  secondPokemonBuildId?: PokemonBuildId;
  thirdPokemonBuildId?: PokemonBuildId;
  reason?: string;
  notes?: string;
  tagIds: TagId[];
  linkedPokemonIds: PokemonSpeciesId[];
};
```

---

## ResearchNote

研究ノート。

Notion ライクな自由メモ。

```ts
type ResearchNote = BaseEntity & {
  title: string;
  content: string;
  linkedPokemonIds: PokemonSpeciesId[];
  linkedPartyIds: PartyId[];
  linkedBattleLogIds: BattleLogId[];
  tagIds: TagId[];
  favorite?: boolean;
  archived?: boolean;
};
```

### Future Feature

将来的には以下のような内部リンクをサポートする。

```text
[[Garchomp]]
[[Rain Team]]
[[Stealth Rock]]
```

---

## DamageNote

ダメージメモ。

```ts
type DamageNote = BaseEntity & {
  title: string;
  content: string;
  attackerPokemonId?: PokemonSpeciesId;
  defenderPokemonId?: PokemonSpeciesId;
  relatedPokemonIds: PokemonSpeciesId[];
  relatedPartyIds: PartyId[];
  tagIds: TagId[];
};
```

### Examples

```text
Garchomp Earthquake always KOs Heatran after Stealth Rock.
```

```text
This spread survives Dragonite Extreme Speed.
```

---

## Tag

タグ。

```ts
type Tag = BaseEntity & {
  name: string;
  color?: string;
  description?: string;
  category?: TagCategory;
};
```

```ts
type TagCategory =
  | "Role"
  | "Archetype"
  | "Type"
  | "Mechanic"
  | "Season"
  | "Custom";
```

### Example Tags

```text
Physical Attacker
Special Attacker
Sweeper
Wall
Support
Setup
Rain
Sun
Sand
Trick Room
Stall
Balance
Hyper Offense
```

---

## UserSetting

ユーザー設定。

```ts
type UserSetting = BaseEntity & {
  theme: "Light" | "Dark" | "System";
  defaultGameId?: GameId;
  defaultRuleSetId?: RuleSetId;
  defaultSeasonId?: SeasonId;
  sidebarCollapsed?: boolean;
  recentPageIds?: string[];
  favoritePokemonIds?: PokemonSpeciesId[];
};
```

---

## AppData

LocalStorage や JSON Export / Import で扱う全体データ。

```ts
type AppData = {
  version: number;
  games: Game[];
  ruleSets: RuleSet[];
  seasons: Season[];
  typeCharts: TypeChart[];
  pokemonSpecies: PokemonSpecies[];
  pokemonKnowledgePages: PokemonKnowledgePage[];
  pokemonBuilds: PokemonBuild[];
  parties: Party[];
  battleLogs: BattleLog[];
  selectionMemos: SelectionMemo[];
  researchNotes: ResearchNote[];
  damageNotes: DamageNote[];
  tags: Tag[];
  userSetting: UserSetting;
};
```

---

## LocalStorage Keys

初期実装では LocalStorage に保存する。

```ts
const STORAGE_KEYS = {
  appData: "pokemon-battle-notebook:app-data",
  appVersion: "pokemon-battle-notebook:version"
};
```

### Requirements

* 保存時に `version` を含める
* 復元時にバリデーションする
* 不正なデータの場合はエラー表示する
* 将来的なマイグレーションに備える

---

## Validation

Zod を使ってデータを検証する。

例:

```ts
import { z } from "zod";

const BaseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});
```

すべての主要モデルに Zod Schema を用意する。

---

## Derived Data

以下の情報は保存せず、必要に応じて計算する。

* ポケモンの弱点
* ポケモンの耐性
* ポケモンの無効タイプ
* パーティ全体の弱点
* 採用パーティ数
* 対戦ログ数
* 研究ノート数
* ダメージメモ数
* 勝率
* 採用率

理由:

* 保存データの重複を避ける
* 元データ変更時の不整合を防ぐ
* UI 側で最新状態を表示できる

---

## Search Index

検索対象は以下。

* PokemonSpecies.name
* PokemonKnowledgePage.personalNotes
* PokemonBuild.moves
* PokemonBuild.item
* PokemonBuild.ability
* Party.name
* Party.concept
* BattleLog.memo
* BattleLog.reflection
* ResearchNote.title
* ResearchNote.content
* DamageNote.title
* DamageNote.content
* Tag.name

初期実装では単純な文字列検索でよい。

将来的には検索インデックスを作成して高速化する。

---

## Relationship Summary

```text
PokemonSpecies
├── PokemonKnowledgePage
├── PokemonBuild
├── BattleLog
├── ResearchNote
├── DamageNote
└── SelectionMemo

Party
├── PokemonBuild[]
├── BattleLog[]
├── ResearchNote[]
└── DamageNote[]

BattleLog
├── Party
├── PokemonSpecies[]
└── PokemonBuild[]
```

---

## MVP Data Priority

最初の MVP で優先するデータモデルは以下。

1. PokemonSpecies
2. PokemonKnowledgePage
3. PokemonBuild
4. Party
5. BattleLog
6. ResearchNote
7. DamageNote
8. BattleMechanic
9. Tag
10. UserSetting

Game、RuleSet、Season は簡易実装でもよい。

---

## Non-goals for Initial MVP

初期 MVP では以下は必須ではない。

* 完全な公式ポケモンデータベース
* 画像データの完全対応
* オンライン同期
* ログイン
* 複数ユーザー
* 完全なダメージ計算
* 複雑な内部リンク
* バックリンク
* AI分析

---

## Final Goal

このデータモデルの最終目標は、以下の体験を実現することである。

> ポケモンを開くと、そのポケモンに関する基本情報・弱点・自分のメモ・採用履歴・対戦ログ・研究ノート・ダメージメモがすべて自然に集まっている。

Pokémon Battle Notebook は、ポケモンごとに知識が育っていくアプリである。
