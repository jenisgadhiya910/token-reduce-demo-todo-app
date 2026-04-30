---
description: Scaffold new feature following CLAUDE.md architecture rules
argument-hint: <feature description, e.g. "due dates" or "priority levels">
---

Add feature: **$ARGUMENTS**

Constraints (from CLAUDE.md — do not violate):
- Client-side only. No `app/api/*` routes. No backend.
- All state through `useTodos()` hook + reducer. No new state libraries.
- All localStorage access via `lib/storage.ts`. If shape changes, bump key version (`todo-app:v1:todos` → `v2`) and write migration.
- New types in `lib/types.ts`.
- Components: PascalCase, one per file, `"use client"` only when needed.
- Tailwind utilities only — no UI kits.
- Keyboard accessible: Enter / Escape / Tab paths must work.

Steps:
1. Read `PROJECT_OVERVIEW.md` and `CLAUDE.md` first. If feature is not listed in `PROJECT_OVERVIEW.md`, STOP and ask before adding.
2. Propose minimal change set: types, reducer actions, hook surface, component diffs. Wait for my approval.
3. Implement in this order: `lib/types.ts` → reducer action → `useTodos` surface → UI component → tests.
4. Co-locate tests next to source (`*.test.ts(x)`).
5. Run `/ship-check` at the end and report.
