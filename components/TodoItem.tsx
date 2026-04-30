"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  setNodeRef?: Ref<HTMLLIElement>;
  style?: CSSProperties;
  isDragging?: boolean;
  isOverlay?: boolean;
  handleRef?: Ref<HTMLButtonElement>;
  handleProps?: HTMLAttributes<HTMLButtonElement>;
};

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  setNodeRef,
  style,
  isDragging,
  isOverlay,
  handleRef,
  handleProps,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

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

  // No `layout`, no `y`/`x` motion values: framer would write its own
  // `transform` and clobber dnd-kit's per-item CSS transform (used for the
  // dragged item lift and sibling shift). Only animate non-transform props.
  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
        transition: { duration: 0.18, ease: "easeOut" as const },
      };

  const overlayClass = isOverlay
    ? "rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    : "border-b border-zinc-200 last:border-b-0 dark:border-zinc-800";

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      {...motionProps}
      className={`group flex items-center gap-2 overflow-hidden px-1 py-3 ${overlayClass} ${
        isDragging ? "pointer-events-none" : ""
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Reorder "${todo.title}"`}
        {...handleProps}
        className="flex h-7 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing dark:hover:bg-zinc-800 dark:hover:text-zinc-200 [@media(pointer:coarse)]:opacity-100"
      >
        <DragHandleIcon />
      </button>

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
          className={`relative flex-1 cursor-pointer text-sm break-words ${
            todo.completed
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          <AnimatedTitle
            text={todo.title}
            completed={todo.completed}
            reducedMotion={!!reducedMotion}
          />
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
    </motion.li>
  );
}

function AnimatedTitle({
  text,
  completed,
  reducedMotion,
}: {
  text: string;
  completed: boolean;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return (
      <span className={completed ? "line-through" : undefined}>{text}</span>
    );
  }
  return (
    <span className="relative inline-block">
      <span>{text}</span>
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: completed ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{ transformOrigin: "left center" }}
        className="pointer-events-none absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current"
      />
    </span>
  );
}

function DragHandleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 16"
      className="h-4 w-2.5"
      fill="currentColor"
    >
      <circle cx="2" cy="3" r="1.2" />
      <circle cx="2" cy="8" r="1.2" />
      <circle cx="2" cy="13" r="1.2" />
      <circle cx="8" cy="3" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="8" cy="13" r="1.2" />
    </svg>
  );
}
