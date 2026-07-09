# Pokémon Battle Notebook

Pokémon Battle Notebook is a Notion-like knowledge workspace for Pokémon battle players.

It is designed to organize battle knowledge by Pokémon, so that every Pokémon can have its own page containing types, weaknesses, resistances, battle mechanics, notes, parties, battle logs, research notes, and damage memos.

The goal is not just to create a battle memo app.

The goal is to build a personal Pokémon battle knowledge base.

---

## Vision

Pokémon Battle Notebook helps players collect, organize, and reuse their battle knowledge across different Pokémon games and generations.

Most battle tools are centered around parties or battle logs.

This project is centered around Pokémon.

Each Pokémon acts as a hub where related information is automatically gathered.

For example, a Pokémon page may include:

* Types
* Weaknesses
* Resistances
* Battle mechanics
* Personal notes
* Used parties
* Battle logs
* Research notes
* Damage memos
* Tags
* Statistics

The app should help users answer questions quickly, such as:

* What is this Pokémon weak to?
* Which parties have I used this Pokémon in?
* What notes have I written about this Pokémon?
* How often have I faced this Pokémon?
* What damage calculations have I saved?
* What battle mechanics can this Pokémon use?

The ideal experience is:

> Open a Pokémon page and understand the most important battle information within 3 seconds.

---

## Core Concept

### Every Pokémon has its own knowledge page

Each Pokémon page should work like a personal Pokédex page.

It combines official-style information with the user's own battle knowledge.

The page should show important information at the top:

* Pokémon name
* Types
* Weaknesses
* Resistances
* Immunities
* Base stats
* Battle mechanic support

Below that, it should collect user-created knowledge:

* Notes
* Parties
* Battle logs
* Research notes
* Damage memos
* Tags
* Usage statistics

This creates a personal battle database that grows over time.

---

## Product Direction

The app should feel like:

* Notion
* A personal Pokédex
* A battle notebook
* A research database
* A second brain for Pokémon battles

The app should not feel like:

* A simple memo app
* A spreadsheet replacement
* A one-generation-only tool
* A cluttered damage calculator
* A generic task management app

---

## UI Direction

The UI should be clean, calm, and easy to read.

The main style is Notion-like, but optimized for Pokémon battle information.

Important UI principles:

* Pokémon pages are the center of the app
* Types, weaknesses, and resistances must be visible immediately
* Use cards, tables, tabs, and side panels
* Keep spacing generous
* Avoid visual clutter
* Prioritize readability over decoration
* Use a right-side Quick View panel on Pokémon detail pages
* Make important battle information accessible without deep navigation

---

## Main Screens

### Dashboard

A home screen that shows:

* Total registered Pokémon
* Created parties
* Battle log count
* Research note count
* Damage memo count
* Recent activity
* Frequently used Pokémon
* Recently opened pages

---

### Pokédex

The Pokédex is one of the most important screens.

It should show a searchable and filterable list of Pokémon.

Each row or card should show:

* Number
* Pokémon name
* Types
* Main weaknesses
* Tags
* Number of used parties
* Number of battle logs

The Pokédex is the entrance to each Pokémon knowledge page.

---

### Pokémon Detail Page

This is the most important screen in the app.

The Pokémon detail page should include:

* Pokémon name
* Pokédex number
* Type badges
* Weakness summary
* Resistance summary
* Immunity summary
* Base stats
* Battle mechanic support
* Personal notes
* Role tags
* Common moves
* Used parties
* Battle logs
* Research notes
* Damage memos
* Statistics
* Right-side Quick View

The top area should make types and weaknesses visible immediately.

---

### Parties

Parties are collections of Pokémon.

A party page should include:

* Party name
* Game
* Rule
* Season
* Concept
* Six Pokémon cards
* Team weakness overview
* Party notes
* Battle logs using this party

The team weakness overview should help users notice problems such as:

* Too many Ice weaknesses
* Too many Ground weaknesses
* No switch-in to a common type
* Lack of type immunity

---

### Battle Logs

Battle logs record individual battles.

Each log may include:

* Date
* Opponent
* Result
* Used party
* Opponent party
* Selected Pokémon
* MVP
* Mistakes
* Reflection
* Tags
* Linked Pokémon

---

### Research Notes

Research notes are free-form notes.

They should support a Notion-like writing experience.

Possible content:

* Matchup notes
* Metagame observations
* Pokémon research
* Team building ideas
* Season reflections
* Strategy notes

In the future, notes may support internal links such as:

```text
[[Garchomp]]
[[Stealth Rock]]
[[Rain Team]]
```

---

### Damage Notes

Damage notes store important damage-related information.

Examples:

* This move always knocks out this Pokémon
* This Pokémon survives a specific attack
* Important speed benchmarks
* Useful EV benchmarks

Damage notes should be linkable to Pokémon and parties.

---

### Tags

Tags help organize knowledge.

Examples:

* Physical Attacker
* Special Attacker
* Sweeper
* Wall
* Support
* Setup
* Trick Room
* Rain
* Sun
* Sand
* Stall
* Balance
* Hyper Offense

---

## Battle Mechanics

The app must not be designed for only one Pokémon generation.

Battle mechanics should be modeled as a flexible system.

Supported mechanics should include:

* Mega Evolution
* Z-Move
* Dynamax
* Gigantamax
* Terastal
* Ultra Burst
* Custom

A Pokémon may have zero or more battle mechanics.

Each battle mechanic should have:

* Type
* Details
* Notes

Examples:

### Terastal

* Tera Type
* Notes

### Mega Evolution

* Mega Stone
* Notes

### Dynamax

* Dynamax availability
* Notes

### Gigantamax

* Gigantamax form
* Notes

### Custom

* Custom name
* Custom fields
* Notes

This structure should make it possible to support future games and future mechanics without redesigning the entire app.

---

## Supported Games

The app should be designed to support multiple Pokémon games and generations.

Initial target examples:

* Pokémon Scarlet / Violet
* Pokémon Sword / Shield
* Pokémon X / Y
* Pokémon Omega Ruby / Alpha Sapphire
* Pokémon Sun / Moon
* Pokémon Ultra Sun / Ultra Moon
* Pokémon Legends: Z-A
* Future Pokémon games
* Custom rule formats

The data model should not depend on a single game.

---

## Technical Direction

Recommended stack:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* Zustand
* React Hook Form
* Zod
* LocalStorage for the first version

Future-friendly design:

* Supabase support later
* Cloud sync later
* AI analysis later
* Plugin-like battle mechanic system later
* Import/export support
* Possible Pokédex data API integration

---

## Development Philosophy

This project should be developed in small phases.

Do not implement everything at once.

Development should proceed by GitHub Issues.

Each Issue should have:

* Goal
* Scope
* Tasks
* Acceptance criteria
* Out of scope

The app should always stay runnable with:

```bash
npm install
npm run dev
```

---

## MVP Scope

The first usable version should focus on:

* Notion-like layout
* Pokédex list
* Pokémon detail page
* Type and weakness display
* Party page
* Battle log page
* LocalStorage persistence
* Basic search
* JSON export/import

Advanced features such as cloud sync, AI analysis, and automatic Pokémon data import can be added later.

---

## Roadmap

### Phase 0: Documentation and Design

* Vision document
* UI specification
* Data model
* Roadmap
* GitHub Issues

### Phase 1: Project Foundation

* Vite + React + TypeScript setup
* Tailwind CSS
* shadcn/ui
* Routing
* Layout
* Sidebar
* Header

### Phase 2: Core UI

* Dashboard
* Pokédex list
* Pokémon detail page
* Party page
* Battle log page

### Phase 3: Data Model

* Pokémon model
* Party model
* Battle log model
* Research note model
* Damage memo model
* Battle mechanic model
* Tag model

### Phase 4: Persistence

* LocalStorage
* Auto save
* Restore data
* JSON export
* JSON import

### Phase 5: CRUD

* Create, edit, delete parties
* Create, edit, delete Pokémon notes
* Create, edit, delete battle logs
* Create, edit, delete research notes
* Create, edit, delete damage notes

### Phase 6: Search and Tags

* Global search
* Tag filtering
* Quick search
* Command palette

### Phase 7: Statistics

* Usage count
* Battle log count
* Party usage
* Win rate
* Team weakness overview

### Phase 8: UX Improvements

* Quick View panel
* Favorites
* Recent pages
* Keyboard shortcuts
* Toast notifications
* Undo

### Phase 9: Pokémon-specific Enhancements

* Type chart
* Weakness calculation
* Battle mechanic UI
* Season management
* Rule management
* Team analyzer

### Phase 10: Future Expansion

* Cloud sync
* Supabase adapter
* AI analysis
* Internal links
* Backlinks
* Plugin system

---

## License

MIT License
