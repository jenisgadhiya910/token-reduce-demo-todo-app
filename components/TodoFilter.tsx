"use client";

import type { Filter } from "@/lib/types";

type Props = {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  hasCompleted: boolean;
  onClearCompleted: () => void;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoFilter({
  filter,
  onFilterChange,
  hasCompleted,
  onClearCompleted,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div
        role="tablist"
        aria-label="Filter todos"
        className="flex items-center gap-1"
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClearCompleted}
        disabled={!hasCompleted}
        className="rounded-md px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        Clear completed
      </button>
    </div>
  );
}
