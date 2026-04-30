"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import type { Todo } from "@/lib/types";
import { SortableTodoItem } from "./SortableTodoItem";
import { TodoItem } from "./TodoItem";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (activeId: string, overId: string) => void;
};

const announcements = {
  onDragStart: ({ active }: { active: { id: string | number } }) =>
    `Picked up todo ${active.id}.`,
  onDragOver: ({
    active,
    over,
  }: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) =>
    over
      ? `Todo ${active.id} is over position ${over.id}.`
      : `Todo ${active.id} is no longer over a droppable area.`,
  onDragEnd: ({
    active,
    over,
  }: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) =>
    over
      ? `Todo ${active.id} dropped over ${over.id}.`
      : `Todo ${active.id} dropped.`,
  onDragCancel: ({ active }: { active: { id: string | number } }) =>
    `Reorder cancelled. Todo ${active.id} returned to its starting position.`,
};

export function TodoList({
  todos,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ids = useMemo(() => todos.map((t) => t.id), [todos]);
  const activeTodo = useMemo(
    () => (activeId ? todos.find((t) => t.id === activeId) ?? null : null),
    [activeId, todos],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Nothing here yet.
      </p>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder?.(String(active.id), String(over.id));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          <AnimatePresence initial={false}>
            {todos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeTodo ? (
          <ul className="list-none">
            <TodoItem
              todo={activeTodo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              isOverlay
              style={{ transform: "scale(1.02)" }}
            />
          </ul>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
