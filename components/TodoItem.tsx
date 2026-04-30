"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraft(todo.title);
    setEditing(true);
  }

  function commit() {
    const title = draft.trim();
    if (title && title !== todo.title) onEdit(todo.id, title);
    setEditing(false);
  }

  function cancel() {
    setDraft(todo.title);
    setEditing(false);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
  }

  return (
    <li className="group flex items-center gap-3 border-b border-zinc-200 px-1 py-3 last:border-b-0 dark:border-zinc-800">
      <input
        id={`todo-${todo.id}`}
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4 cursor-pointer accent-zinc-900 dark:accent-zinc-50"
      />

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          aria-label="Edit todo"
          className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
        />
      ) : (
        <label
          htmlFor={`todo-${todo.id}`}
          onDoubleClick={startEditing}
          className={`flex-1 cursor-pointer text-sm break-words ${
            todo.completed
              ? "text-zinc-400 line-through dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {todo.title}
        </label>
      )}

      {!editing && (
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Edit "${todo.title}"`}
          className="rounded px-2 py-1 text-xs text-zinc-500 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-900 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          Edit
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="rounded px-2 py-1 text-xs text-zinc-500 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        Delete
      </button>
    </li>
  );
}
