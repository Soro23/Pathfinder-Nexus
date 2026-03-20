---
name: Testing Stack Setup
description: Vitest configuration, versions chosen, and key decisions made during initial test suite setup
type: project
---

Vitest v4.1.0 + @testing-library/react v16.3.2 + jsdom v29.0.1 + @testing-library/jest-dom v6.9.1 were installed as devDependencies. No Playwright yet (Phase 3 not started).

`vite.config.ts` uses `/// <reference types="vitest" />` triple-slash directive so the `test` block is TypeScript-recognized without a separate `vitest.config.ts`. CSS Modules are configured with `classNameStrategy: 'non-scoped'` to avoid import failures in tests.

`npm test` runs `vitest run` (CI-friendly single pass). `npm run test:watch` runs `vitest` for interactive mode.

**Why:** Vitest was chosen over Jest because the project uses Vite 8 + native ESM — Jest requires extra transform config; Vitest reuses the Vite config natively and is significantly faster.

**How to apply:** Always use Vitest for new test files. Do not introduce Jest. Keep the `test` block inside `vite.config.ts` (not a separate vitest.config.ts) unless the config grows too large.
