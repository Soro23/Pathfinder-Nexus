# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathfinder Nexus is a Pathfinder (d20/SRD 3.5) character management web app. Stack: React 19 + TypeScript + Vite, Zustand for state (persisted to localStorage), React Router v7, CSS Modules + CSS Variables (no Tailwind), Lucide React for icons.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # tsc + vite build (type-check + bundle)
npm run preview   # Preview production build
```

No test runner is configured.

## Architecture

### Routing

All routes are nested under `<Layout />` in [src/App.tsx](src/App.tsx):

| Path | Component |
|------|-----------|
| `/` | Dashboard |
| `/characters/new` | CharacterNew |
| `/characters/:id` | CharacterView |
| `/characters/:id/play` | PlayMode |
| `/rules` | Rules |

Campaigns page is not yet implemented (Phase 4).

### State

Single Zustand store in [src/store/characterStore.ts](src/store/characterStore.ts), persisted to localStorage under key `pathfinder-nexus-characters`. All `Character` types and helper functions (`calculateModifier`, `getModifierString`, `generateId`) live here. There is no campaign store yet.

### Data Layer

Static SRD data in [src/data/](src/data/) — `classes.ts`, `feats.ts`, `skills.ts`, `spells.ts`. No external API calls; everything is bundled JSON/TS.

### Component Structure

- `src/components/ui/` — base primitives (Button, Input, Card, Select), each with a paired `.module.css`
- `src/components/character/` — character-specific sections (FeatsSelector, InventoryManager, SkillsList, Spellbook, WeaponManager)
- `src/components/layout/Layout.tsx` — shell with header/sidebar/footer, wraps all routes via React Router `<Outlet>`

### Styling

CSS Variables defined in [src/styles/variables.css](src/styles/variables.css) (color palette, spacing, typography). Each component uses CSS Modules. Key design tokens: `--color-accent-gold: #d4a44c`, `--color-bg-primary: #1a1612`. Fonts: Cinzel (headings), Crimson Text (body), Fira Code (numbers/stats) — loaded from Google Fonts.

### Pathfinder Calculations

Core formula helpers in [src/store/characterStore.ts](src/store/characterStore.ts):
- `calculateModifier(score)` → `Math.floor((score - 10) / 2)`
- Combat stats (AC, saves, BAB, CMB, CMD) are computed in component files from raw ability scores + class data

## Current Status

See [ROADMAP.md](ROADMAP.md) for full progress. Phases 1–2 complete, Phase 3 ~90% done (critical confirmation pending), Phases 4–5 not started.
