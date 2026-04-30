Create a new React component called $ARGUMENTS in `components/` following these rules from CLAUDE.md:

- One component per file, PascalCase filename
- Named export (no default export)
- `"use client"` directive only if it touches state, effects, or events
- TypeScript strict — no `any`, props typed via an explicit `Props` type
- Tailwind utility classes inline, no CSS modules
- Interactive elements must be keyboard-reachable
- Import shared types from `lib/types.ts`

Before writing, read `components/TodoApp.tsx` to match the existing style.
After writing, run `npm run lint` and report any issues.
