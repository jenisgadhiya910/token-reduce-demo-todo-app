"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useReducedMotion } from "framer-motion";
import type { Todo } from "@/lib/types";
import { TodoItem } from "./TodoItem";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function SortableTodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const reducedMotion = useReducedMotion();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: reducedMotion ? undefined : transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <TodoItem
      todo={todo}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      handleRef={setActivatorNodeRef}
      handleProps={{ ...attributes, ...listeners }}
    />
  );
}
