# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read this before making any changes.

## Project Summary
A simple todo app — **Next.js 16 (App Router) + TypeScript + Tailwind CSS** with **localStorage** for persistence. Fully client-side. No API routes, no backend. See `PROJECT_OVERVIEW.md` for the full feature list and structure.

## Commands
```bash
npm run dev            # start dev server on http://localhost:3000
npm run build          # production build
npm start              # run production build
npm run lint           # ESLint

npm test               # run Jest test suite
npm run test:watch     # Jest in watch mode
npm run test:coverage  # Jest with coverage report

# run a single test file or pattern
npm test -- hooks/useTodos.test.ts
npm test -- -t "toggles a todo"
```

Path alias: `@/*` resolves to the repo root (configured in `tsconfig.json` and mirrored in `jest.config.ts`). Prefer `@/lib/storage` over relative paths that climb out of the current dir.

## Architecture Rules

### 1. Client / Server Component Boundary
- localStorage is **browser-only** — any component or hook that touches it MUST start with `"use client"`.
- `app/page.tsx` should stay a server component and just render `<TodoApp />` (which is `"use client"`).
- Never call `localStorage.*` directly during render — wrap it in `useEffect` or use the storage helper.

### 2. State Management
- **Single source of truth**: a `useTodos()` custom hook in `hooks/useTodos.ts`.
- Internally uses `useReducer` with these actions: `ADD`, `TOGGLE`, `EDIT`, `DELETE`, `CLEAR_COMPLETED`, `HYDRATE`.
- Persists to localStorage in a `useEffect` triggered when `todos` changes.
- Hydrates from localStorage **after mount** (not in the reducer initializer) to avoid hydration mismatch.

### 3. Hydration Pattern
To prevent hydration warnings, render a stable empty state on the server, then hydrate from localStorage on the client:

```tsx
const [hydrated, setHydrated] = useState(false);
useEffect(() => {
  dispatch({ type: "HYDRATE", payload: storage.read() });
  setHydrated(true);
}, []);
if (!hydrated) return <TodoSkeleton />; // or null
```

### 4. Storage Wrapper
All localStorage access goes through `lib/storage.ts`. Never use raw `localStorage.*` elsewhere.

```ts
// lib/storage.ts shape
export const storage = {
  read(): Todo[] { /* SSR guard + JSON.parse + try/catch */ },
  write(todos: Todo[]): void { /* SSR guard + JSON.stringify + try/catch */ },
};
```

Key: `"todo-app:v1:todos"` (versioned — bump if the shape changes).

### 5. IDs
Use `crypto.randomUUID()`. No need for `uuid` or `nanoid` packages.

## Coding Conventions

### Files & Naming
- One component per file, PascalCase filename (e.g., `TodoItem.tsx`).
- Hooks in `hooks/`, prefix with `use` (e.g., `useTodos.ts`).
- Types and pure helpers in `lib/`.
- Named exports preferred; default exports only for Next.js page/layout files.

### TypeScript
- `strict: true` in `tsconfig.json`.
- No `any`. Use `unknown` + narrowing if a type is uncertain.
- Define types in `lib/types.ts` and import where needed.

### Styling
- Tailwind utility classes inline in JSX.
- No CSS modules, no styled-components.
- Use semantic HTML: `<ul>`, `<li>`, `<button type="button">`, `<input type="text">`, etc.

### Accessibility
- All interactive elements must be keyboard-reachable.
- Add button: Enter submits.
- Edit mode: Enter saves, Escape cancels.
- Checkbox is a real `<input type="checkbox">` with a label association.
- Delete button has a clear `aria-label`.

## Testing
- **Stack**: Jest 30 + `@testing-library/react` + `@testing-library/user-event` + `jest-dom` matchers (auto-loaded via `jest.setup.ts`).
- **Environment**: `jsdom` (configured in `jest.config.ts` via `next/jest`).
- **Co-locate**: tests live next to source as `*.test.ts(x)` (e.g., `components/TodoItem.test.tsx`, `hooks/useTodos.test.ts`, `lib/storage.test.ts`).
- For hook tests use `renderHook` + `act` from `@testing-library/react`.
- For storage tests, reset `localStorage` between tests; jsdom provides a working implementation.
- Prefer user-event over fireEvent — it more closely simulates real keyboard / click flows the a11y rules above depend on.

## What NOT to Do
- ❌ Don't create `app/api/...` routes — this is fully client-side.
- ❌ Don't add Redux, Zustand, Jotai, or any state library — `useReducer` is enough.
- ❌ Don't add UI kits (shadcn, MUI, Chakra) — Tailwind utilities are enough for this scope.
- ❌ Don't access `localStorage` outside `lib/storage.ts`.
- ❌ Don't use `useState` for the todos array — use the `useTodos` hook.
- ❌ Don't add features outside the list in `PROJECT_OVERVIEW.md` without asking the user first.
- ❌ Don't add a database, auth, or sync layer.

## Implementation Order (suggested)
1. Scaffold Next.js 16 app with TS + Tailwind.
2. Define `lib/types.ts` and `lib/storage.ts`.
3. Build `hooks/useTodos.ts` with reducer + persistence.
4. Build `TodoApp` shell, then `TodoInput`, `TodoList`, `TodoItem`, `TodoFilter`.
5. Wire filtering and "clear completed" in the footer.
6. Polish styling and keyboard interactions.
7. Verify: refresh page → todos persist; no hydration warnings in console.

## Definition of Done
- All features in `PROJECT_OVERVIEW.md` work.
- `npm run build` succeeds with zero errors and zero warnings.
- `npm run lint` is clean.
- `npm test` passes.
- No hydration mismatches in browser console.
- Keyboard accessible end-to-end.
- Works on mobile (responsive) and desktop.

## When in Doubt
- Prefer simplicity over cleverness — this is a small app.
- Match existing patterns in the codebase.
- Ask before adding any new dependency.
- Re-read this file and `PROJECT_OVERVIEW.md` before architectural decisions.
