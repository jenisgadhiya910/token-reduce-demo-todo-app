# CLAUDE.md

Guidance for Claude Code in this repo. Read before changes.

## Project Summary
**React Router v7 (framework mode, formerly Remix)** + **TypeScript** + **Drizzle ORM** (SQLite via Turso/libSQL) + **Tailwind CSS** + **Conform** (forms) + **Vitest**. SSR-first; minimal client JS.

## Commands
```bash
pnpm dev               # react-router dev
pnpm build             # react-router build
pnpm start             # react-router-serve ./build/server/index.js
pnpm typecheck         # react-router typegen && tsc
pnpm lint              # ESLint

pnpm db:generate       # drizzle-kit generate
pnpm db:migrate        # drizzle-kit migrate
pnpm db:studio         # drizzle-kit studio
pnpm db:seed           # tsx db/seed.ts

pnpm test              # Vitest
pnpm test:e2e          # Playwright
```

Path alias: `~/*` → `app/*` (RR convention).

## Architecture Rules

### 1. Loaders & Actions Are The API
- Data fetching: **`loader`** in the route file. Returns typed `data()` / `Response`.
- Mutations: **`action`** in the route file. Driven by `<Form method="post">` — progressive enhancement first.
- Don't add `app/routes/api.*.ts` "endpoints" unless the data is consumed by a non-RR client (mobile, webhook).
- Prefer **resource routes** over client-side `fetch` for cross-route data.

### 2. Auth Inside Loaders/Actions
- Every loader/action that touches user data starts with `await requireUser(request)` from `app/lib/auth.server.ts`.
- Sessions: cookie-based via `createCookieSessionStorage`. Helpers in `app/lib/session.server.ts`.
- Authorization checks happen here — never trust client-sent role flags.

### 3. Drizzle
- Schema: `db/schema.ts`. Migrations in `drizzle/`.
- Client instantiated once in `app/db.server.ts`. The `.server.ts` suffix makes RR strip it from client bundles — **always** use `.server.ts` for DB / secret-handling modules.
- Query helpers in `app/models/<resource>.server.ts` — loaders/actions call these, never raw `db.select()` inline.
- Use prepared statements for hot paths.

### 4. Forms (Conform + Zod)
- Schemas in `app/schemas/`.
- Action pattern:
  ```ts
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") return data(submission.reply(), { status: 400 });
  ```
- Render errors via `useForm` + `getFieldsetProps`. No client-only validation libraries.

### 5. Components
- Route components stay thin: load data via `useLoaderData`, render presentational components from `app/components/`.
- `app/components/` is presentational — no `useLoaderData`, no `useFetcher` inside. Pass data via props.
- Shared layout in `app/root.tsx` + nested layouts via parent routes.

### 6. Client-Side Bits
- Default: no client JS. Add `useState` / effects only when interaction demands it.
- For optimistic UI use `useFetcher` + the optimistic value from `fetcher.formData`. Don't reach for TanStack Query.

## Coding Conventions

### Files
- Route files use the v7 file convention: `app/routes/users.$id.tsx`, `app/routes/users.$id.edit.tsx`.
- `.server.ts` / `.server.tsx` = server-only.
- `.client.ts` / `.client.tsx` = client-only.
- Components: PascalCase in `app/components/`.

### TypeScript
- `strict: true`. No `any`.
- Loader/action types are auto-generated via `react-router typegen`. Run after route changes.

### Styling
- Tailwind utilities. `cn()` helper from `app/lib/cn.ts`.
- Global styles in `app/styles/tailwind.css`, imported via `links()` in `root.tsx`.

### Env Vars
- Validated in `app/env.server.ts` with Zod. Never read `process.env.X` outside that file.

## Testing
- Unit / component: Vitest + RTL.
- Loader/action tests: invoke directly with a mocked `Request`. No HTTP layer.
- E2E: Playwright against a build with a seeded test DB.

## What NOT to Do
- ❌ Don't add `app/routes/api.*` endpoints when a loader/action fits.
- ❌ Don't `fetch('/api/…')` from a component — use `useFetcher` or a loader.
- ❌ Don't import `.server.ts` modules from client components.
- ❌ Don't put business logic in `app/components/`.
- ❌ Don't add Redux / Zustand — RR loaders/fetchers cover state.
- ❌ Don't use raw `localStorage` for session data — use cookie sessions.

## Definition of Done
- `pnpm typecheck` + `pnpm lint` clean.
- `pnpm build` succeeds.
- New routes have loader/action with auth where applicable.
- Forms degrade without JS (test with JS disabled for critical paths).
- New DB changes have a Drizzle migration committed.
