---
description: Bump localStorage key version + write migration when Todo shape changes
allowed-tools: Read, Edit, Grep, Glob, Bash(npm test:*)
argument-hint: <reason — e.g. "added priority field" or "renamed text→title">
---

Bump storage version. Reason: **$ARGUMENTS**

Steps:
1. Read `lib/storage.ts` and `lib/types.ts`. Identify current version key (`todo-app:vN:todos`).
2. Bump to `vN+1`.
3. Write a migration function `migrateFromVN(raw: unknown): Todo[]` inside `lib/storage.ts`:
   - Try parsing new key first.
   - If absent, try previous key, run migration, then write to new key + delete old key.
   - Use Zod or hand-written narrowing for safety. No `any`.
4. Update `storage.read()` to call migration when needed.
5. Add test in `lib/storage.test.ts` that:
   - Seeds old-key data into `localStorage`.
   - Calls `storage.read()`.
   - Asserts old key removed, new key present, payload matches new shape.
6. Run `npm test -- lib/storage.test.ts`.
7. Report: old version, new version, fields added/removed/renamed, test result.
