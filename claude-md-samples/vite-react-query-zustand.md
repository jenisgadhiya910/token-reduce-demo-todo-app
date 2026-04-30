# CLAUDE.md

Guidance for Claude Code when working in this repo. Read before changes.

## Project Summary
Vite + React 19 + TypeScript SPA. Server state via **TanStack Query v5**, client state via **Zustand**, routing via **React Router v7**, forms via **React Hook Form + Zod**, styling via **Tailwind CSS v4**. Tests with **Vitest** + **React Testing Library**.

## Commands
```bash
pnpm dev               # Vite dev server on http://localhost:5173
pnpm build             # tsc -b && vite build
pnpm preview           # serve build locally
pnpm lint              # ESLint (flat config)
pnpm typecheck         # tsc --noEmit

pnpm test              # Vitest run
pnpm test:watch        # Vitest watch
pnpm test:ui           # Vitest UI
pnpm test:coverage     # v8 coverage

# single file / pattern
pnpm test src/hooks/useUser.test.ts
pnpm test -t "fetches user"
```

Path alias: `@/*` → `src/*` (set in `tsconfig.json` + `vite.config.ts` via `vite-tsconfig-paths`).

## Architecture Rules

### 1. Server State vs Client State
- **TanStack Query owns server state.** Never duplicate query data into Zustand or `useState`. Read via `useQuery` / `useSuspenseQuery`, mutate via `useMutation`, invalidate via `queryClient.invalidateQueries`.
- **Zustand owns ephemeral client state** that crosses component trees: theme, sidebar open, modal stack, current filter. Slice stores under `src/stores/` — one file per slice.
- Local-only state (input value, hover) stays in `useState`.

### 2. Query Keys
- Centralize keys in `src/lib/queryKeys.ts` as factory functions:
  ```ts
  export const userKeys = {
    all: ["users"] as const,
    list: (filters: UserFilters) => [...userKeys.all, "list", filters] as const,
    detail: (id: string) => [...userKeys.all, "detail", id] as const,
  };
  ```
- Never inline string-array keys in components — invalidation drift bites.

### 3. Data Fetching Layer
- All `fetch` calls go through `src/lib/api.ts` (typed wrapper around `fetch` with base URL, auth header, Zod-validated responses).
- Each resource gets a `src/api/<resource>.ts` file exporting plain async functions (`getUser`, `listUsers`, …). Components call these via TanStack Query — never directly.

### 4. Forms
- React Hook Form + `@hookform/resolvers/zod`.
- Zod schemas live in `src/schemas/`. Reuse the same schema for client validation and (if applicable) for parsing API responses.
- Always pass `mode: "onBlur"` for new forms unless the design needs onChange.

### 5. Routing
- React Router v7 in **declarative** mode (no framework mode here).
- Route tree in `src/router.tsx`. Lazy-load route components with `React.lazy` + Suspense boundaries.
- Loaders only for navigation-critical data; everything else stays in components via TanStack Query.

## Coding Conventions

### Files
- Components: PascalCase, one per file (`UserCard.tsx`).
- Hooks: `src/hooks/`, prefix `use` (`useDebounce.ts`).
- Stores: `src/stores/`, suffix `Store` (`themeStore.ts`).
- Tests co-located: `Foo.tsx` + `Foo.test.tsx`.

### TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`.
- No `any`. Use `unknown` + Zod narrowing.
- Shared types in `src/types/`.

### Styling
- Tailwind v4 utilities inline. Use `cn()` (clsx + tailwind-merge) from `src/lib/utils.ts` for conditional classes.
- No CSS modules, no styled-components.

## Testing
- Vitest + RTL + `@testing-library/user-event` v14.
- `vitest.setup.ts` extends `expect` with `@testing-library/jest-dom` and resets MSW handlers.
- Mock network with **MSW** in `src/mocks/`. Never mock `fetch` directly.
- For TanStack Query tests, wrap render in a fresh `QueryClientProvider` per test (`{ retry: false, gcTime: 0 }`).

## What NOT to Do
- ❌ Don't add Redux / Jotai / Recoil — Zustand + TanStack Query covers it.
- ❌ Don't fetch in `useEffect` — use TanStack Query.
- ❌ Don't store server data in Zustand.
- ❌ Don't add a UI kit (MUI, Chakra). shadcn/ui via CLI is allowed if user requests.
- ❌ Don't bypass `src/lib/api.ts`.
- ❌ Don't add new deps without asking.

## Definition of Done
- `pnpm build` zero errors / warnings.
- `pnpm lint` clean.
- `pnpm typecheck` clean.
- `pnpm test` passes.
- New routes lazy-loaded.
- New mutations invalidate the right query keys.
