"use client";

import { useCallback, useMemo, useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { Filter } from "@/lib/types";
import { TodoFilter } from "./TodoFilter";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";

export function TodoApp() {
  const {
    todos,
    hydrated,
    add,
    toggle,
    edit,
    remove,
    clearCompleted,
    reorder,
  } = useTodos();
  const [filter, setFilter] = useState<Filter>("all");

  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      const from = todos.findIndex((t) => t.id === activeId);
      const to = todos.findIndex((t) => t.id === overId);
      if (from < 0 || to < 0) return;
      reorder(from, to);
    },
    [todos, reorder],
  );

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const remaining = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos],
  );
  const hasCompleted = todos.some((t) => t.completed);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <header className="flex items-baseline justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Todos
          </h1>
          <span
            aria-live="polite"
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            {hydrated
              ? `${remaining} ${remaining === 1 ? "item" : "items"} left`
              : " "}
          </span>
        </header>

        <div className="px-5 py-4">
          <TodoInput onAdd={add} />
        </div>

        <div className="px-5">
          {hydrated ? (
            <TodoList
              todos={visibleTodos}
              onToggle={toggle}
              onEdit={edit}
              onDelete={remove}
              onReorder={handleReorder}
            />
          ) : (
            <div className="py-8" aria-hidden />
          )}
        </div>

        <footer className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <TodoFilter
            filter={filter}
            onFilterChange={setFilter}
            hasCompleted={hasCompleted}
            onClearCompleted={clearCompleted}
          />
        </footer>
      </div>
    </div>
  );
}
