# Todo App — Project Overview

## Description
A simple, fast todo list app built with **Next.js 16** using browser **localStorage** for persistence. Fully client-side — no API routes, no backend, no database.

## Goals
- Clean, minimal UI
- Instant interactions (no network latency)
- Persists across browser sessions via localStorage
- Type-safe with TypeScript
- Small, easy-to-read codebase

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Storage**: Browser `localStorage`
- **State**: React `useReducer` + a custom `useTodos` hook

## Core Features
1. **Add todo** — text input + Enter or button to create
2. **Toggle complete** — checkbox marks done / undone
3. **Edit todo** — inline edit on click (Enter saves, Escape cancels)
4. **Delete todo** — per-item delete button
5. **Filter** — All / Active / Completed tabs
6. **Clear completed** — bulk-remove finished items
7. **Counter** — show count of remaining active todos
8. **Persistence** — auto-saved to localStorage

## Data Model

```ts
// lib/types.ts
export type Todo = {
  id: string;          // crypto.randomUUID()
  text: string;        // task description
  completed: boolean;  // done state
  createdAt: number;   // Date.now()
};

export type Filter = "all" | "active" | "completed";
```

## Project Structure
```
todo-app/
├── app/
│   ├── layout.tsx           # root layout
│   ├── page.tsx             # renders <TodoApp />
│   └── globals.css          # Tailwind directives
├── components/
│   ├── TodoApp.tsx          # client-side root ("use client")
│   ├── TodoInput.tsx        # add-new-todo input
│   ├── TodoList.tsx         # list renderer
│   ├── TodoItem.tsx         # single row (toggle / edit / delete)
│   └── TodoFilter.tsx       # filter tabs + clear-completed
├── hooks/
│   └── useTodos.ts          # state + localStorage sync
├── lib/
│   ├── storage.ts           # SSR-safe localStorage wrapper
│   └── types.ts             # shared types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## UI Layout
A single centered card on a neutral background:
- **Header** — app title + remaining count
- **Input row** — text field + add button
- **List** — todos with checkbox, text, edit, delete
- **Footer** — filter tabs (All / Active / Completed) + Clear Completed

## Storage Strategy
- Single localStorage key: `"todo-app:v1:todos"` (versioned for future migrations)
- All reads/writes go through `lib/storage.ts` helpers
- Always guard with `typeof window !== "undefined"` to prevent SSR errors
- Hydrate from localStorage in `useEffect` after mount to avoid hydration mismatch

## Constraints (Out of Scope)
- ❌ No API routes (`app/api/...`)
- ❌ No external database
- ❌ No authentication / user accounts
- ❌ No sync across devices
- ❌ No external state libraries (Redux, Zustand, etc.)
- ❌ No UI component libraries (shadcn, MUI, etc.) — Tailwind only

## Success Criteria
- Adding, editing, deleting, completing, filtering all work
- Refreshing the page preserves todos
- No console errors or hydration warnings
- Keyboard accessible (Enter to add, Enter/Escape in edit mode)
- Looks clean on both mobile and desktop
