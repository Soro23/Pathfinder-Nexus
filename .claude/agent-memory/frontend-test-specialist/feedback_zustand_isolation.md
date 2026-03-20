---
name: Zustand Store Isolation Pattern
description: How to correctly reset Zustand store and localStorage between tests to prevent state leakage
type: feedback
---

Use `useCharacterStore.setState({ characters: [] })` + `localStorage.clear()` in `beforeEach` to isolate store state between tests.

Do NOT use `vi.stubGlobal('localStorage', ...)` at module scope in test files that import the store — the Zustand `persist` middleware captures the real jsdom `localStorage` reference at module import time, before the stub is applied. The stub ends up being a different object from what the middleware writes to, causing persistence assertions to always see `null`.

**Why:** Discovered during initial test suite setup — persistence test failed because the stub was applied after the store was instantiated. jsdom provides a working localStorage in the test environment; we only need to clear it, not replace it.

**How to apply:** Any test file that imports `useCharacterStore` should reset with `setState` + `localStorage.clear()` in `beforeEach`. Never use `vi.stubGlobal('localStorage', ...)` at module scope in these files.
