# Roadmap

## Overview

Pokémon Battle Notebook は、一度にすべてを実装しない。

小さな Phase と Issue に分けて、少しずつ開発する。

開発の基本方針は以下である。

* 最初に UI と体験を固める
* Pokémon Detail Page を最重要画面として扱う
* まず LocalStorage で動く MVP を作る
* その後、検索・統計・UX 改善を追加する
* Cloud sync や AI analysis は後回しにする
* 各 Issue は小さく切る
* 1 Issue で複数の大きな機能を実装しない

---

## Product Priority

このアプリで最も重要なのは、以下の体験である。

> ポケモンを開いた瞬間、そのポケモンのタイプ・弱点・耐性・自分のメモ・関連データが見やすく整理されていること。

したがって、最初の MVP では以下を優先する。

1. Notion-like layout
2. Pokédex list
3. Pokémon detail page
4. Type / weakness / resistance display
5. Quick View panel
6. Party page
7. Team weakness overview
8. Battle logs
9. Research notes
10. LocalStorage persistence

---

## Development Workflow

開発は GitHub Issue 単位で進める。

各 Issue には以下を必ず書く。

* Goal
* Scope
* Tasks
* Acceptance Criteria
* Out of Scope

Codex や AI coding assistant に依頼するときは、原則として 1 回につき 1 Issue のみを実装させる。

---

## Phase 0: Documentation and Planning

### Goal

実装前に、プロジェクトの目的・UI・データモデル・開発計画を明文化する。

### Deliverables

* README.md
* docs/vision.md
* docs/ui-spec.md
* docs/data-model.md
* docs/roadmap.md
* GitHub Issue templates
* Initial GitHub Issues

### Completion Criteria

* プロジェクトの方向性が README に書かれている
* UI の基準が ui-spec.md に書かれている
* データモデルが data-model.md に書かれている
* 開発順序が roadmap.md に書かれている
* 最初の実装 Issue が作成できる状態になっている

---

## Phase 1: Project Foundation

### Goal

React + TypeScript の開発環境を構築する。

### Main Tasks

* Vite setup
* React setup
* TypeScript strict mode
* Tailwind CSS setup
* shadcn/ui setup
* React Router setup
* Zustand setup
* React Hook Form setup
* Zod setup
* ESLint setup
* Prettier setup
* Basic directory structure
* Import alias setup

### Target Issues

* Issue #001: Project setup
* Issue #002: Directory structure
* Issue #003: ESLint / Prettier setup
* Issue #004: Tailwind and shadcn/ui setup

### Completion Criteria

* `npm install` works
* `npm run dev` works
* `npm run build` works
* TypeScript strict mode is enabled
* Basic app screen is displayed

---

## Phase 2: Global Layout

### Goal

Notion-like global layout を作る。

### Main Tasks

* Sidebar
* Header
* Main layout
* Page routing
* Basic navigation
* Responsive layout foundation
* Theme foundation

### Target Issues

* Issue #005: Main layout
* Issue #006: Sidebar navigation
* Issue #007: Header
* Issue #008: Routing
* Issue #009: Responsive layout foundation

### Completion Criteria

* Sidebar から主要ページへ移動できる
* Header が全ページで表示される
* Main content area がページごとに切り替わる
* Mobile layout の土台がある

---

## Phase 3: Core UI Mock Screens

### Goal

保存機能なしで、主要画面の UI をダミーデータで作る。

### Main Screens

* Dashboard
* Pokédex list
* Pokémon detail page
* Party list
* Party detail page
* Battle log list
* Research notes
* Damage notes
* Settings

### Target Issues

* Issue #010: Dashboard UI
* Issue #011: Pokédex list UI
* Issue #012: Pokémon detail page UI
* Issue #013: Quick View panel UI
* Issue #014: Party list UI
* Issue #015: Party detail page UI
* Issue #016: Team weakness overview UI
* Issue #017: Battle log list UI
* Issue #018: Research notes UI
* Issue #019: Damage notes UI
* Issue #020: Settings UI

### Completion Criteria

* 主要画面をクリックで移動できる
* ダミーデータで UI が確認できる
* Pokémon detail page にタイプ・弱点・耐性が表示される
* Quick View panel が表示される
* Party detail page に Team Weakness Overview が表示される

---

## Phase 4: Type System and Data Model

### Goal

データモデルを TypeScript と Zod で実装する。

### Main Tasks

* Type definitions
* Zod schemas
* Mock data
* Data validation utilities
* Type-safe domain models

### Target Issues

* Issue #021: Base types
* Issue #022: Game / RuleSet / Season types
* Issue #023: Pokémon type and type chart models
* Issue #024: PokemonSpecies model
* Issue #025: PokemonKnowledgePage model
* Issue #026: PokemonBuild model
* Issue #027: BattleMechanic model
* Issue #028: Party model
* Issue #029: BattleLog model
* Issue #030: ResearchNote model
* Issue #031: DamageNote model
* Issue #032: Tag and UserSetting models
* Issue #033: Zod schemas

### Completion Criteria

* 主要データモデルが TypeScript で定義されている
* 主要データモデルに Zod schema がある
* `any` を使わない
* Mock data が型安全に扱える

---

## Phase 5: Type Effectiveness

### Goal

タイプ・弱点・耐性・無効を計算できるようにする。

### Main Tasks

* Type chart data
* Type effectiveness calculation
* Weakness grouping
* Resistance grouping
* Immunity grouping
* Team weakness summary calculation

### Target Issues

* Issue #034: Type chart data
* Issue #035: Type effectiveness utility
* Issue #036: Pokémon weakness calculation
* Issue #037: Pokémon resistance calculation
* Issue #038: Pokémon immunity calculation
* Issue #039: Team weakness summary calculation
* Issue #040: Display calculated matchups in UI

### Completion Criteria

* ポケモンのタイプから弱点を計算できる
* ×4、×2、×0.5、×0 を分類できる
* Pokémon detail page に計算結果が表示される
* Party detail page にチーム弱点概要が表示される

---

## Phase 6: State Management and LocalStorage

### Goal

アプリの状態管理と保存機能を実装する。

### Main Tasks

* Zustand stores
* LocalStorage adapter
* Auto save
* Data restore
* JSON export
* JSON import
* Error handling

### Target Issues

* Issue #041: App store structure
* Issue #042: Pokémon store
* Issue #043: Party store
* Issue #044: Battle log store
* Issue #045: Notes store
* Issue #046: Settings store
* Issue #047: LocalStorage service
* Issue #048: Auto save
* Issue #049: Data restore
* Issue #050: JSON export
* Issue #051: JSON import

### Completion Criteria

* データが LocalStorage に保存される
* ページ更新後もデータが復元される
* JSON export ができる
* JSON import ができる
* 不正データに対してエラー処理がある

---

## Phase 7: CRUD Features

### Goal

ユーザーが実際にデータを作成・編集・削除できるようにする。

### Main Tasks

* Create
* Edit
* Delete
* Duplicate
* Confirmation dialog
* Form validation

### Target Issues

* Issue #052: Create Pokémon knowledge page
* Issue #053: Edit Pokémon knowledge page
* Issue #054: Edit Pokémon notes
* Issue #055: Create party
* Issue #056: Edit party
* Issue #057: Delete party
* Issue #058: Add Pokémon build to party
* Issue #059: Edit Pokémon build
* Issue #060: Remove Pokémon build
* Issue #061: Edit BattleMechanic
* Issue #062: Create battle log
* Issue #063: Edit battle log
* Issue #064: Delete battle log
* Issue #065: Create research note
* Issue #066: Edit research note
* Issue #067: Delete research note
* Issue #068: Create damage note
* Issue #069: Edit damage note
* Issue #070: Delete damage note

### Completion Criteria

* 主要データを作成できる
* 主要データを編集できる
* 主要データを削除できる
* 削除前に確認ダイアログが出る
* フォーム入力にバリデーションがある

---

## Phase 8: Search and Tags

### Goal

情報へすばやくアクセスできるようにする。

### Main Tasks

* Global search
* Pokédex search
* Party search
* Battle log search
* Note search
* Tag filtering
* Command palette foundation

### Target Issues

* Issue #071: Global search utility
* Issue #072: Pokédex search
* Issue #073: Party search
* Issue #074: Battle log search
* Issue #075: Research note search
* Issue #076: Damage note search
* Issue #077: Tag filtering
* Issue #078: Command palette

### Completion Criteria

* ポケモン名で検索できる
* 技・持ち物・特性・メモで検索できる
* タグで絞り込める
* Header から検索できる
* Ctrl+K で検索 UI を開ける

---

## Phase 9: Statistics

### Goal

自分の対戦・構築データを見える化する。

### Main Tasks

* Usage count
* Battle log count
* Win rate
* Party usage
* Frequently used Pokémon
* Recently updated pages
* Team weakness statistics

### Target Issues

* Issue #079: Pokémon usage count
* Issue #080: Battle log count by Pokémon
* Issue #081: Party usage statistics
* Issue #082: Win rate calculation
* Issue #083: Dashboard statistics
* Issue #084: Recently updated pages
* Issue #085: Team weakness statistics

### Completion Criteria

* Dashboard に統計が表示される
* Pokémon detail page に関連データ数が表示される
* Party page に勝率や使用状況が表示される
* Team weakness overview が集計される

---

## Phase 10: UX Improvements

### Goal

毎日使いやすい UI に改善する。

### Main Tasks

* Favorites
* Recent pages
* Toast notifications
* Undo
* Keyboard shortcuts
* Loading states
* Empty states
* Error states
* Mobile improvements

### Target Issues

* Issue #086: Favorites
* Issue #087: Recent pages
* Issue #088: Toast notifications
* Issue #089: Undo foundation
* Issue #090: Keyboard shortcuts
* Issue #091: Loading states
* Issue #092: Empty states
* Issue #093: Error states
* Issue #094: Mobile UI improvements

### Completion Criteria

* お気に入り登録ができる
* 最近開いたページが表示される
* 保存や削除時に通知が出る
* 空データ時の表示が自然
* モバイルでも主要画面が見やすい

---

## Phase 11: Pokémon-specific Enhancements

### Goal

ポケモン対戦アプリとしての独自価値を高める。

### Main Tasks

* Battle mechanic editor
* Game management
* Rule management
* Season management
* Selection memo
* Rental team code
* Damage note improvements
* Team analyzer improvements

### Target Issues

* Issue #095: Battle mechanic editor
* Issue #096: Custom battle mechanic support
* Issue #097: Game management
* Issue #098: RuleSet management
* Issue #099: Season management
* Issue #100: Selection memo UI
* Issue #101: Selection memo CRUD
* Issue #102: Rental team code field
* Issue #103: Damage note linking improvements
* Issue #104: Team analyzer improvements

### Completion Criteria

* バトルギミックを柔軟に編集できる
* ゲーム・ルール・シーズンを管理できる
* 選出メモを保存できる
* ダメージメモがポケモンやパーティにリンクできる

---

## Phase 12: Future Expansion

### Goal

将来的な拡張に備える。

### Possible Features

* Supabase sync
* Login
* Cloud backup
* AI analysis
* Internal links
* Backlinks
* Plugin system
* Pokémon data API integration
* Official data import
* Advanced damage calculation
* Shareable pages

### Target Issues

* Issue #105: Storage adapter abstraction
* Issue #106: Supabase adapter prototype
* Issue #107: Internal link parser
* Issue #108: Backlink data model
* Issue #109: AI analysis interface design
* Issue #110: Plugin architecture design
* Issue #111: Pokémon data import design
* Issue #112: Final refactoring

### Completion Criteria

* 将来機能を追加しやすい構造になっている
* 保存層が抽象化されている
* 内部リンクや AI 分析を追加しやすい
* 不要コードが整理されている

---

## MVP Definition

最初の MVP は、以下ができる状態とする。

### Required

* アプリが起動する
* Notion-like layout がある
* Pokédex list がある
* Pokémon detail page がある
* タイプ・弱点・耐性・無効が見える
* Quick View panel がある
* Party page がある
* Team weakness overview がある
* Battle log を表示できる
* Research note を表示できる
* LocalStorage に保存できる
* JSON export/import ができる

### Not Required

* ログイン
* クラウド同期
* AI 分析
* 完全な公式図鑑データ
* 公式画像連携
* 完全な Notion エディタ
* 完全なダメージ計算機

---

## Development Rules for AI Assistants

AI coding assistants must follow these rules.

1. Implement one Issue at a time.
2. Do not implement future Phase features unless instructed.
3. Do not rewrite unrelated files.
4. Keep TypeScript strict.
5. Do not use `any`.
6. Keep UI and logic separated.
7. Place domain logic in `utils` or `services`.
8. Keep reusable UI in `components`.
9. Keep feature-specific UI in `features`.
10. Maintain `npm run build` success.
11. Summarize changed files after implementation.
12. Provide testing steps after implementation.

---

## First Implementation Order

最初に Codex へ依頼する順番は以下。

1. Issue #001: Project setup
2. Issue #002: Directory structure
3. Issue #004: Tailwind and shadcn/ui setup
4. Issue #005: Main layout
5. Issue #006: Sidebar navigation
6. Issue #008: Routing
7. Issue #010: Dashboard UI
8. Issue #011: Pokédex list UI
9. Issue #012: Pokémon detail page UI
10. Issue #013: Quick View panel UI

最初の山場は Pokémon detail page である。

この画面の完成度が、アプリ全体の方向性を決める。

---

## Final Goal

Pokémon Battle Notebook の最終目標は、次の状態である。

> ポケモンごとに知識が整理され、対戦で必要な情報へすぐアクセスできる、自分だけのポケモン対戦ナレッジベース。

最初から完璧なアプリを目指すのではなく、毎日使える小さな MVP を作り、そこから少しずつ育てていく。
