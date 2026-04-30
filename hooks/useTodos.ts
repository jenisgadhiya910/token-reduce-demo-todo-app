"use client";

import { useEffect, useReducer, useRef } from "react";
import { storage } from "@/lib/storage";
import type { Todo } from "@/lib/types";

type Action =
  | { type: "ADD"; title: string }
  | { type: "TOGGLE"; id: string }
  | { type: "EDIT"; id: string; title: string }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_COMPLETED" }
  | { type: "REORDER"; from: number; to: number }
  | { type: "HYDRATE"; payload: Todo[] };

type State = {
  todos: Todo[];
  hydrated: boolean;
};

const initialState: State = { todos: [], hydrated: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { todos: action.payload, hydrated: true };
    case "ADD": {
      const title = action.title.trim();
      if (!title) return state;
      const next: Todo = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: Date.now(),
      };
      return { ...state, todos: [next, ...state.todos] };
    }
    case "TOGGLE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t,
        ),
      };
    case "EDIT": {
      const title = action.title.trim();
      if (!title) {
        return {
          ...state,
          todos: state.todos.filter((t) => t.id !== action.id),
        };
      }
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, title } : t,
        ),
      };
    }
    case "DELETE":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
      };
    case "CLEAR_COMPLETED":
      return { ...state, todos: state.todos.filter((t) => !t.completed) };
    // REORDER works on absolute indices in the underlying todos array; callers map filtered positions back to absolute before dispatch so hidden items stay put.
    case "REORDER": {
      const { from, to } = action;
      const len = state.todos.length;
      if (from === to) return state;
      if (from < 0 || from >= len || to < 0 || to >= len) return state;
      const next = state.todos.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...state, todos: next };
    }
  }
}

export function useTodos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const persistRef = useRef(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", payload: storage.read() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    if (!persistRef.current) {
      persistRef.current = true;
      return;
    }
    storage.write(state.todos);
  }, [state.todos, state.hydrated]);

  return {
    todos: state.todos,
    hydrated: state.hydrated,
    add: (title: string) => dispatch({ type: "ADD", title }),
    toggle: (id: string) => dispatch({ type: "TOGGLE", id }),
    edit: (id: string, title: string) => dispatch({ type: "EDIT", id, title }),
    remove: (id: string) => dispatch({ type: "DELETE", id }),
    clearCompleted: () => dispatch({ type: "CLEAR_COMPLETED" }),
    reorder: (from: number, to: number) =>
      dispatch({ type: "REORDER", from, to }),
  };
}
