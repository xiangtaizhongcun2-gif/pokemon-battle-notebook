# UI Specification

## Overview

Pokémon Battle Notebook の UI は、Notion ライクな知識管理アプリをベースにしながら、ポケモン対戦に必要な情報へすぐアクセスできることを重視する。

このアプリの中心は「ポケモン詳細ページ」である。

特に以下の情報は、ユーザーがページを開いてすぐ確認できる必要がある。

* タイプ
* 弱点
* 耐性
* 無効
* バトルギミック
* 自分の重要メモ

UI の最優先目標は以下である。

> 対戦で必要な情報へ、3秒でたどり着けること。

---

## Design Principles

### 1. Pokémon First

このアプリは、パーティ中心ではなくポケモン中心に設計する。

すべての情報は、できる限りポケモン詳細ページへ集約される。

ポケモン詳細ページには、以下の関連情報が表示される。

* 基本情報
* タイプ相性
* バトルギミック
* 自分のメモ
* 採用したパーティ
* 対戦ログ
* 研究ノート
* ダメージメモ
* タグ
* 統計

---

### 2. Notion-like, but Pokémon-optimized

Notion のように、情報をページ・カード・テーブル・セクションで整理する。

ただし、Notion を完全に再現する必要はない。

ポケモン対戦に必要な情報は、Notion よりも素早く見えるようにする。

特にタイプ・弱点・耐性は、通常のメモよりも優先度が高い。

---

### 3. Fast Recognition

文字を読まなくても、重要情報が視覚的に分かる UI を目指す。

例:

* タイプはバッジで表示
* 弱点倍率は大きく表示
* ×4 弱点は目立たせる
* 無効タイプは別枠で表示
* バトルギミックはアイコンまたはチップで表示

---

### 4. Calm and Readable

UI は落ち着いた見た目にする。

避けるもの:

* 派手すぎる色
* 強すぎるグラデーション
* ガラス風 UI
* 過度なアニメーション
* 情報の詰め込みすぎ
* 装飾のための装飾

重視するもの:

* 余白
* 見出し
* 階層
* カード
* 読みやすい文字サイズ
* 一貫した配置

---

## Global Layout

全体レイアウトは以下を基本とする。

```text
┌──────────────────────────────────────────────┐
│ Header                                       │
├───────────────┬──────────────────────────────┤
│ Sidebar       │ Main Content                 │
│               │                              │
│               │                              │
└───────────────┴──────────────────────────────┘
```

---

## Sidebar

Sidebar は常に左側に配置する。

### Navigation Items

```text
Dashboard
Pokédex
Parties
Battle Logs
Research Notes
Damage Notes
Tags
Settings
```

### Sidebar Requirements

* 現在のページをハイライトする
* 折りたたみ可能
* モバイルではドロワー表示
* アイコン + ラベル形式
* Pokédex を上位に配置する
* 余白を広めに取る

---

## Header

Header には以下を置く。

* 現在のページ名
* グローバル検索
* 新規作成ボタン
* テーマ切り替え
* 設定へのショートカット

将来的には Command Palette を追加する。

---

## Dashboard

Dashboard はアプリのホーム画面。

### Purpose

最近の情報にすぐアクセスする。

### Sections

* Quick Stats
* Recent Pokémon
* Recent Parties
* Recent Battle Logs
* Recent Notes
* Favorites

### Quick Stats

表示例:

* 登録ポケモン数
* パーティ数
* 対戦ログ数
* 研究ノート数
* ダメージメモ数

### Layout

```text
Dashboard

[Quick Stat] [Quick Stat] [Quick Stat] [Quick Stat]

Recent Pokémon
[Card] [Card] [Card]

Recent Battle Logs
[Table]

Recent Notes
[List]
```

---

## Pokédex List Page

Pokédex は、このアプリの主要画面の1つ。

### Purpose

ポケモンを検索し、各ポケモン詳細ページへ移動する。

### Required UI

* 検索バー
* タイプフィルター
* 弱点フィルター
* タグフィルター
* ゲームフィルター
* 表示切り替え

  * Table View
  * Card View

---

### Table View Columns

```text
No.
Name
Types
Main Weaknesses
Immunities
Tags
Parties
Battle Logs
Updated
```

### Card View

各カードに表示する情報:

* ポケモン名
* 図鑑番号
* タイプ
* 主要弱点
* 無効タイプ
* タグ
* 採用パーティ数
* 対戦ログ数

カードは情報量を抑え、クリックで詳細へ移動する。

---

## Pokémon Detail Page

この画面がアプリの中心である。

### Purpose

1匹のポケモンに関するすべての知識を集約する。

### Layout

```text
┌─────────────────────────────────────────────┐
│ Main Pokémon Content           Quick View   │
│                                             │
│ Header                       ┌────────────┐ │
│ Type Matchup                 │ Quick Info │ │
│ Notes                        │            │ │
│ Linked Parties               │            │ │
│ Battle Logs                  │            │ │
│ Research Notes               │            │ │
│ Damage Notes                 │            │ │
└─────────────────────────────┴────────────┘
```

---

### Pokémon Header

ページ上部に表示する。

表示内容:

* ポケモン名
* 図鑑番号
* フォルム
* タイプバッジ
* タグ
* お気に入りボタン

例:

```text
Garchomp
#0445

[Dragon] [Ground]

[Physical Attacker] [Sweeper] [Ground Immunity Check]
```

---

### Type Matchup Section

ページ上部に必ず表示する。

表示内容:

* Weaknesses
* Resistances
* Immunities

### Weaknesses

倍率ごとに分ける。

```text
Weaknesses

×4
Ice

×2
Dragon
Fairy
```

### Resistances

```text
Resistances

×0.5
Fire
Poison
Rock
```

### Immunities

```text
Immunities

×0
Electric
```

### Requirements

* ×4 は最も目立つようにする
* ×2 は通常の弱点として表示
* ×0 は Immunities として別表示
* タイプ名はバッジ形式
* 将来的にはタイプアイコンに対応できる構造にする

---

## Quick View Panel

Pokémon Detail Page の右側に固定表示する。

### Purpose

スクロールしても重要情報を見失わないようにする。

### Contents

* Pokémon name
* Types
* Main weakness
* Immunities
* Battle mechanics
* Used party count
* Battle log count
* Research note count
* Damage memo count
* Favorite toggle
* Quick actions

### Example

```text
Quick View

Garchomp

Types
Dragon / Ground

Main Weakness
Ice ×4

Immunity
Electric ×0

Battle Mechanics
Mega
Terastal
Dynamax

Linked Data
Parties: 8
Battle Logs: 52
Notes: 15
Damage Memos: 7
```

### Behavior

* Desktop: right side fixed panel
* Tablet: collapsible side panel
* Mobile: shown as a sticky summary or bottom sheet

---

## Battle Mechanic Section

Battle Mechanic はポケモン詳細ページ内に表示する。

### Supported Mechanics

* Mega Evolution
* Z-Move
* Dynamax
* Gigantamax
* Terastal
* Ultra Burst
* Custom

### UI

チップまたはカードで表示する。

```text
Battle Mechanics

[Mega Evolution]
Mega Stone: Garchompite

[Terastal]
Tera Type: Steel

[Dynamax]
Available
```

### Requirements

* 作品固有の項目を固定しすぎない
* Custom mechanic を追加可能にする
* 将来的にプラグイン化しやすい構成にする

---

## Personal Notes Section

ポケモン詳細ページ内に表示する。

### Purpose

ユーザーがそのポケモンについて学んだことを書く。

### UI

* Markdown 風の入力
* 見出し
* 箇条書き
* チェックリスト
* タグ
* 更新日時

### Future Idea

内部リンクをサポートする。

```text
[[Garchomp]]
[[Rain Team]]
[[Stealth Rock]]
```

---

## Linked Parties Section

そのポケモンを採用したパーティを表示する。

### Card Contents

* パーティ名
* ゲーム
* ルール
* シーズン
* コンセプト
* 勝率
* 更新日

クリックで Party Detail Page へ移動する。

---

## Battle Logs Section

そのポケモンに関連する対戦ログを表示する。

### Table Columns

```text
Date
Result
Opponent
Used Party
Selected
Memo
Tags
```

---

## Research Notes Section

そのポケモンにリンクされた研究ノートを表示する。

### Card Contents

* タイトル
* 抜粋
* タグ
* 更新日

---

## Damage Notes Section

そのポケモンに関連するダメージメモを表示する。

### Example

```text
Damage Notes

- Survives Dragonite Extreme Speed after Intimidate
- Ice Beam always KOs Garchomp
- Outspeeds base 100 Pokémon with this EV spread
```

---

## Party List Page

### Purpose

作成したパーティを一覧管理する。

### Required UI

* 検索
* ゲームフィルター
* ルールフィルター
* シーズンフィルター
* タグフィルター
* お気に入り
* ソート

### Card Contents

* パーティ名
* 6匹のポケモン
* ゲーム
* ルール
* シーズン
* コンセプト
* 勝率
* 更新日

---

## Party Detail Page

### Purpose

1つのパーティの情報をまとめる。

### Layout

```text
Party Header

Six Pokémon Cards

Team Weakness Overview

Party Notes

Battle Logs

Research Notes
```

---

### Six Pokémon Cards

各カードに表示する情報:

* ポケモン名
* タイプ
* 主要弱点
* 無効タイプ
* 持ち物
* 特性
* 技
* バトルギミック
* 役割タグ

---

### Team Weakness Overview

パーティ全体のタイプ相性を見える化する。

### Required Information

* 各タイプに対して弱いポケモン数
* 各タイプを半減できるポケモン数
* 各タイプを無効にできるポケモン数
* 危険な偏りの警告

### Example

```text
Team Weakness Overview

Ice
Weak: 3
Resist: 1
Immune: 0
Warning: High risk

Ground
Weak: 2
Resist: 1
Immune: 2
```

---

## Battle Log List Page

### Purpose

対戦記録を一覧管理する。

### Table Columns

```text
Date
Result
Opponent
Used Party
Opponent Team
Selected Pokémon
MVP
Tags
Memo
```

### Filters

* Result
* Game
* Rule
* Season
* Party
* Tags
* Pokémon

---

## Battle Log Detail Page

### Contents

* Date
* Game
* Rule
* Season
* Opponent
* Result
* Used party
* Opponent party
* Selected Pokémon
* Opponent selected Pokémon
* MVP
* Mistakes
* Reflection
* Memo
* Linked Pokémon
* Tags

---

## Research Notes Page

### Purpose

自由な研究メモを書く。

### UI

* Notion-like document list
* Editor area
* Tags
* Linked Pokémon
* Linked parties
* Updated date

---

## Damage Notes Page

### Purpose

ダメージ計算や重要な耐久・火力メモを保存する。

### UI

* List
* Search
* Filters
* Linked Pokémon
* Linked parties
* Tags

---

## Tags Page

### Purpose

タグを管理する。

### Tag Examples

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

## Settings Page

### Contents

* Theme
* Default game
* Default rule
* Data export
* Data import
* Reset data
* App information

---

## Responsive Design

### Desktop

* Sidebar visible
* Quick View visible
* Tables can be wide

### Tablet

* Sidebar collapsible
* Quick View collapsible
* Cards become 2 columns

### Mobile

* Sidebar becomes drawer
* Quick View becomes sticky summary or bottom sheet
* Cards become 1 column
* Tables become stacked cards

---

## Color and Style

### General

* Calm
* Minimal
* Notion-like
* Readable
* Light mode first
* Dark mode later

### Avoid

* Too many bright colors
* Heavy shadows
* Glassmorphism
* Excessive animation
* Cluttered UI

### Use

* Soft backgrounds
* Clear borders
* Subtle shadows
* Rounded cards
* Type badges
* Section headers
* Consistent spacing

---

## MVP UI Priority

最初の MVP では、以下を優先する。

1. Global Layout
2. Sidebar
3. Dashboard
4. Pokédex List
5. Pokémon Detail Page
6. Quick View Panel
7. Party Detail Page
8. Team Weakness Overview
9. Battle Log List
10. Research Notes

特に Pokémon Detail Page と Quick View Panel を最重要 UI とする。

---

## Non-goals for Initial MVP

最初の MVP では以下は必須ではない。

* 完全な Notion エディタ
* クラウド同期
* AI 分析
* 公式画像連携
* 完全なダメージ計算機
* オンライン共有
* ログイン機能
* 複数ユーザー対応

---

## Final UI Goal

最終的な UI の理想は以下である。

> ポケモン名を開いた瞬間、そのポケモンのタイプ・弱点・自分の知識・関連データがすべて整理されて見えること。

Pokémon Battle Notebook は、ただ情報を保存するだけではなく、ポケモン対戦の知識を見やすく育てるための UI を目指す。
