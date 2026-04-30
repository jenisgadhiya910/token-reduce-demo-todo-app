---
description: Generate Jest + RTL test for a component
allowed-tools: Read, Write, Glob, Grep, Bash(npm test:*)
argument-hint: <ComponentName, e.g. TodoItem>
---

Generate test for component **$ARGUMENTS**.

Steps:
1. Locate `components/$ARGUMENTS.tsx`. If missing, list candidates and stop.
2. Read the file. Identify props, callbacks, conditional renders, keyboard handlers.
3. Create `components/$ARGUMENTS.test.tsx` co-located. Stack:
   - Jest 30 + `@testing-library/react` + `@testing-library/user-event` v14
   - `jest-dom` matchers (auto-loaded via `jest.setup.ts`)
4. Cover:
   - Renders with required props (smoke test)
   - Each callback fires with expected payload
   - Keyboard paths from CLAUDE.md (Enter / Escape / Tab)
   - Each conditional branch (e.g. completed vs active state)
   - `aria-label` / role assertions for a11y
5. Use `userEvent.setup()` per test; never `fireEvent` for keyboard/click flows.
6. Run `npm test -- components/$ARGUMENTS.test.tsx` and report.
7. Do NOT modify the component itself unless I ask.
