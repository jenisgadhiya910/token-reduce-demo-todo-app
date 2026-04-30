---
description: Keyboard + screen-reader audit of changed components against CLAUDE.md a11y rules
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob
argument-hint: (no args — audits current branch diff vs main)
---

Audit accessibility on changed components. Do NOT modify code.

Steps:
1. Run `git diff main...HEAD --name-only` and pick the changed `.tsx` files under `components/` and `app/`.
2. For each, check against CLAUDE.md "Accessibility" rules:
   - All interactive elements keyboard-reachable (no `div` with `onClick` without `role`/`tabIndex`)
   - Add input: Enter submits
   - Edit mode: Enter saves, Escape cancels
   - Checkboxes are real `<input type="checkbox">` with associated `<label>`
   - Delete buttons have `aria-label`
   - `<button type="button">` set explicitly when not submitting a form
3. Also flag:
   - Missing focus styles (no `focus-visible:` Tailwind utility)
   - Color contrast risk (text on bg using only Tailwind palette mid-tones)
   - Drag-and-drop without keyboard alternative
4. Output one table:
   `file:line | rule violated | suggested fix`
5. End with `PASS` or `N issues — review above`.
