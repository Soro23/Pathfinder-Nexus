# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathfinder Nexus is a Pathfinder (d20/SRD 3.5) character and campaign management web app. Stack: React 19 + TypeScript + Vite, Zustand for state, Supabase for auth and data persistence, React Router v7, CSS Modules + CSS Variables (no Tailwind), Lucide React for icons.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # tsc + vite build (type-check + bundle)
npm run preview   # Preview production build
npm run test      # vitest run
```

## Architecture

### Routing

Defined in [src/App.tsx](src/App.tsx). `/landing` and `/login` are public. Everything else sits behind `<ProtectedRoute />` (gated by `AuthProvider`); most protected routes are nested under `<Layout />` (sidebar shell), except `/campaigns/:id/party` which renders standalone.

| Path | Component |
|------|-----------|
| `/` | Dashboard |
| `/characters/new`, `/characters/import` | CharacterNew, CharacterImport |
| `/characters/:id` | CharacterView |
| `/characters/:id/play` | PlayMode |
| `/campaigns`, `/campaigns/new`, `/campaigns/:id` | CampaignList, CampaignNew, CampaignView |
| `/campaigns/:id/party` | PartyView (outside the sidebar shell) |
| `/rules`, `/srd`, `/tables`, `/skills`, `/spells`, `/items`, `/feats`, `/bestiary`, `/classes`, `/races`, `/npcs` | Compendium reference pages |
| `/homebrew`, `/admin`, `/tools` | Homebrew, Admin (restricted to the admin user), Tools |

### Auth & Persistence

Auth is Supabase-backed ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx), [src/lib/supabase.ts](src/lib/supabase.ts)), enforced by [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx). Characters and campaigns are **persisted to Supabase** (`characters`/campaign tables), not to localStorage — `updateCharacter`/`addCharacter` in `characterStore.ts` write through `supabase.from('characters')`. The Zustand store holds the in-memory working copy for the logged-in session; without an active Supabase session, writes fail with "No hay una sesión activa".

### State

Zustand stores in [src/store/](src/store/): `characterStore.ts` (characters — `Character` type plus `calculateModifier`, `getModifierString`, `generateId`), `campaignStore.ts`, `customSpellsStore.ts`, `homebrewStore.ts`, `srdStore.ts`.

### Engine layer

[src/engine/](src/engine/) is the single source of truth for derived Pathfinder 1e stats — components should call these, not reimplement formulas:
- `combatStats.ts` — AC/touch/flat-footed, saves, BAB, CMB/CMD, initiative (`computeCombatStats`, `computeEffectiveMaxHp`, `computeWeaponAttackBonus`, `getIterativeAttackOffsets`)
- `modifiers.ts` — `resolveModifiers` (feats/items/armor/race/status effects/conditions/temporary effects → `ResolvedStats`), `stackModifiers` (bonus-type stacking rules), `CONDITION_MODIFIERS` (SRD condition penalties)
- `rollBreakdown.ts` — builds per-modifier breakdowns (with stacking applied/discarded flags) for the roll-result and stat-explain drawers in Modo Juego
- `skills.ts`, `weapon.ts`, `size.ts`, `carryingCapacity.ts`, `speed.ts`, `spellSlots.ts`, `levelProgression.ts`, `characterProgression.ts`, `xp.ts`, `companion.ts` — the rest of the formula surface

### Data Layer

Static SRD data in [src/data/](src/data/) — `classes.ts`, `feats.ts`, `skills.ts`, `spells.ts`, `races.ts`, `domains.ts`, `blessings.ts`, `archetypes.ts`, `animalCompanions.ts`, `templates.ts`, `classFeatureEffects.ts`. Game-rules content is bundled JSON/TS with no external content API; Supabase is only used for auth and character/campaign persistence.

### Component Structure

- `src/components/ui/` — base primitives (Button, Input, Card, Select, SearchSelect, HomebrewBadge, Drawer), each with a paired `.module.css`
- `src/components/character/` — character sheet and Modo Juego widgets (FeatsSelector, InventoryManager, SkillsList, Spellbook, WeaponManager, ArsenalManager, DomainPicker, BlessingPicker, ArchetypeSelector, ClassProgressionTable, LevelUpModal, AnimalCompanion, HpTracker, StatPill, WeaponAttackRow, ClassFeatureRow, StatusEffectsPanel, ConditionPanel, ModifierBreakdownList, StatExplainPanel, RollExplainDrawer)
- `src/components/campaign/` — campaign-specific (CharacterAssigner, PartyCard, EncounterTracker, CampaignCharacterCard)
- `src/components/layout/Layout.tsx` — shell with header/sidebar/footer, wraps protected routes via React Router `<Outlet>`

### Styling

CSS Variables in [src/styles/variables.css](src/styles/variables.css) implement "The Chronicler's Interface" design system: light parchment surfaces by default (`--color-surface: #fcf9f0`), carmesí primary (`--color-primary: #7b001f`), dorado secondary, with a full dark variant under `[data-theme="dark"]`. Fonts: Noto Serif (display/headings), Inter (body), Fira Code (numbers/stats) — loaded from Google Fonts. Legacy variable names (`--color-accent-gold`, `--color-bg-primary`, etc.) still exist as aliases onto the new tokens for backward compatibility with older components; prefer the new token names in new code.

### Pathfinder Calculations

`calculateModifier(score)` → `Math.floor((score - 10) / 2)` lives in `characterStore.ts`. All other combat/skill math (AC, saves, BAB, CMB, CMD, skill totals, carrying capacity, speed) lives in `src/engine/` — see "Engine layer" above.

## Testing

Vitest (`npm run test`). Coverage concentrates on `src/engine/__tests__/`, `src/store/__tests__/`, `src/data/__tests__/`, `src/lib/__tests__/`.

## Current Status

There is no `ROADMAP.md` in the repo. Auth, Supabase persistence, and the Campaigns feature are implemented, not future work. Modo Juego (`PlayMode.tsx`) received a full redesign (condition panel, temporary-effect-driven class powers, roll/stat breakdown drawers, unified drawer primitive) — see [docs/redesign-references/Especificaciones_disenyo_modo_juego.md](docs/redesign-references/Especificaciones_disenyo_modo_juego.md) for the spec that drove it.
