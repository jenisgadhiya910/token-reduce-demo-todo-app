---
name: Todo App Testing Patterns
description: Key patterns, quirks, and gotchas discovered while setting up Jest for this Next.js 16 + React 19 todo app
type: project
---

**Jest setup uses `next/jest` with `createJestConfig` in `jest.config.ts`, `setupFilesAfterEnv` pointing to `jest.setup.ts` which imports `@testing-library/jest-dom`.**

**Why:** Next.js 16 requires `next/jest` to transform app-router files correctly; plain `ts-jest` or `babel-jest` alone won't handle Next.js internals.

**How to apply:** Always use `createJestConfig` from `next/jest.js` (`.js` extension required for ESM compat). Path alias `@/*` → `<rootDir>/*` must be in `moduleNameMapper`.

---

**React 19 + @testing-library/react v16: `renderHook` flushes effects synchronously.**

**Why:** The new React 19 concurrency model means `useEffect` runs before `renderHook` returns in the test environment. There is no "before hydration" state observable via `renderHook` — effects fire immediately.

**How to apply:** Do not write tests that assert on pre-effect state after `renderHook()`. Instead assert on the post-effect state directly. The `await act(async () => {})` pattern still works as a belt-and-suspenders flush.

---

**SSR guard testing: `delete global.window` does NOT make `typeof window === "undefined"` in jsdom.**

**Why:** jsdom's global bindings make `window` re-accessible even after `delete`. The `typeof` check in `storage.ts` sees the real jsdom window.

**How to apply:** To test SSR guard behavior, mock `localStorage` to throw or be `undefined` via `Object.defineProperty(window, 'localStorage', { value: undefined, writable: true, configurable: true })`. Then restore after the test.

---

**`storage.ts` uses `window.localStorage` (not bare `localStorage`) — always mock via `Object.defineProperty(window, 'localStorage', ...)` in a fresh `beforeEach` store.**

**How to apply:** Each test file that exercises storage should reassign `window.localStorage` in `beforeEach` to an in-memory `Record<string, string>` implementation to ensure isolation.

---

**`useTodos` mock pattern: `jest.mock('@/lib/storage', ...)` at module level, then `jest.clearAllMocks()` + `mockRead.mockReturnValue([])` in `beforeEach`.**

**How to apply:** Cast `storage.read` and `storage.write` as `jest.MockedFunction<...>` for type-safe `.mock.calls` access without `any`.

---

**`crypto.randomUUID` mock: `jest.spyOn(crypto, 'randomUUID').mockImplementation(...)` with a counter closure.**

**How to apply:** Cast return value as template literal type `` `${string}-${string}-${string}-${string}-${string}` `` to satisfy strict TypeScript for `crypto.randomUUID`'s return type. Call `jest.restoreAllMocks()` in `afterEach`.
