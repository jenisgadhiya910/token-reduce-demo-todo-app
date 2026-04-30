# CLAUDE.md

Guidance for Claude Code in this repo. Read before changes.

## Project Summary
Full-stack **Next.js 15 (App Router)** + **TypeScript** + **Prisma** (PostgreSQL) + **tRPC v11** + **Auth.js v5** + **Tailwind CSS** + **shadcn/ui**. Deployed on Vercel; DB on Neon.

## Commands
```bash
pnpm dev               # next dev --turbo
pnpm build             # next build
pnpm start             # next start
pnpm lint              # next lint
pnpm typecheck         # tsc --noEmit

pnpm db:generate       # prisma generate
pnpm db:migrate        # prisma migrate dev
pnpm db:deploy         # prisma migrate deploy (CI/prod)
pnpm db:studio         # prisma studio
pnpm db:seed           # tsx prisma/seed.ts

pnpm test              # Vitest
pnpm test:e2e          # Playwright
```

Path alias: `@/*` → repo root.

## Architecture Rules

### 1. Server vs Client Components
- Default to **Server Components**. Add `"use client"` only when needed (state, effects, browser APIs, event handlers).
- Pages, layouts, and data-fetching wrappers stay server-side.
- Pass server-fetched data down as props; don't refetch on the client.

### 2. tRPC Layer
- Routers in `server/api/routers/`, merged in `server/api/root.ts`.
- Use `protectedProcedure` for authed endpoints, `publicProcedure` otherwise. Never expose Prisma client directly.
- Input validation: **Zod** on every procedure. No untyped inputs.
- Server Components call tRPC via `api` (the server caller in `trpc/server.ts`).
- Client Components use the React Query–backed hooks from `trpc/react.tsx`.

### 3. Prisma
- Schema: `prisma/schema.prisma`. After edits run `pnpm db:migrate` with a descriptive name.
- Client instantiated **once** in `server/db.ts` with the global-singleton pattern (avoids dev hot-reload connection storms).
- No raw SQL unless absolutely needed; if so, use `Prisma.sql` tagged template — never string-concat user input.
- Use `select` to project fields. Never return whole records to the client by default.

### 4. Auth (Auth.js v5)
- Config in `auth.ts` at repo root. Session strategy: JWT.
- Server: `await auth()` to get session. Client: `useSession()`.
- Middleware (`middleware.ts`) protects routes via matcher — keep matcher tight, don't blanket-protect.
- Roles live on `session.user.role`. Authorization checks happen in tRPC procedures, not middleware.

### 5. UI / shadcn
- Components added via `pnpm dlx shadcn@latest add <name>`. They land in `components/ui/` — these are **owned** by us, edit freely.
- App-specific components in `components/`. Don't put business logic in `components/ui/`.
- Theming via CSS variables in `app/globals.css` + `next-themes` provider.

### 6. Forms & Mutations
- React Hook Form + Zod. Reuse the same Zod schema in the tRPC input.
- Mutations: `api.foo.bar.useMutation({ onSuccess: () => utils.foo.list.invalidate() })`.
- Server Actions only for simple form posts where tRPC would be overkill (e.g., logout). Don't mix patterns within one feature.

## Coding Conventions

### Files
- Route segments: `app/(group)/segment/page.tsx`. Use route groups to share layouts without affecting URLs.
- One component per file, PascalCase.
- Server-only utilities: import `"server-only"` at top of the file.
- Client-only utilities: import `"client-only"` at top.

### TypeScript
- `strict: true`. No `any`.
- Prisma-generated types are the source of truth for DB shapes — derive UI types from them when possible (`Prisma.UserGetPayload<…>`).

### Styling
- Tailwind utilities only. `cn()` helper from `lib/utils.ts` for conditionals.
- Use shadcn primitives — don't reinvent `<Button>`, `<Dialog>`, etc.

### Env Vars
- Validated via `@t3-oss/env-nextjs` in `env.ts`. Add new vars there with a Zod type — never read `process.env.X` directly in app code.

## Testing
- Unit / component: Vitest + RTL.
- E2E: Playwright against a local build with a seeded test database.
- tRPC procedures: test via `appRouter.createCaller({ session, db })` — no HTTP needed.

## What NOT to Do
- ❌ Don't put Prisma calls in client components or in `app/api/*` routes when a tRPC procedure would do.
- ❌ Don't import server-only modules into client components — it'll bundle secrets.
- ❌ Don't use `getServerSideProps` / pages-router APIs — App Router only.
- ❌ Don't disable RLS expectations by querying around the auth session.
- ❌ Don't commit `.env*` files. Use `.env.example` for shape.
- ❌ Don't add a second state library — TanStack Query (via tRPC) handles server state.

## Definition of Done
- `pnpm build` clean.
- `pnpm typecheck` + `pnpm lint` clean.
- New procedures have Zod input + auth check.
- New DB columns have a migration committed.
- Sensitive fields excluded via `select`.
- E2E happy path passes locally.
