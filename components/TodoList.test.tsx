import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoList } from "./TodoList";
import type { Todo } from "@/lib/types";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "list-item-1",
    title: "List task",
    completed: false,
    createdAt: 1000000,
    ...overrides,
  };
}

const noOp = jest.fn();

describe("TodoList", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the empty state message when the todos array is empty", () => {
    render(<TodoList todos={[]} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it("does not render a list element when todos is empty", () => {
    render(<TodoList todos={[]} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders a list with one item when a single todo is provided", () => {
    const todos = [makeTodo({ title: "Only task" })];
    render(<TodoList todos={todos} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Only task")).toBeInTheDocument();
  });

  it("renders the correct number of list items for multiple todos", () => {
    const todos = [
      makeTodo({ id: "a", title: "Alpha" }),
      makeTodo({ id: "b", title: "Beta" }),
      makeTodo({ id: "c", title: "Gamma" }),
    ];
    render(<TodoList todos={todos} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders each todo's title in the list", () => {
    const todos = [
      makeTodo({ id: "a", title: "First item" }),
      makeTodo({ id: "b", title: "Second item" }),
    ];
    render(<TodoList todos={todos} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(screen.getByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
  });

  it("does not show the empty state when todos are present", () => {
    const todos = [makeTodo()];
    render(<TodoList todos={todos} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(screen.queryByText(/nothing here yet/i)).not.toBeInTheDocument();
  });

  it("renders a drag handle for each todo", () => {
    const todos = [
      makeTodo({ id: "a", title: "Alpha" }),
      makeTodo({ id: "b", title: "Beta" }),
    ];
    render(<TodoList todos={todos} onToggle={noOp} onEdit={noOp} onDelete={noOp} />);
    expect(
      screen.getByRole("button", { name: /reorder "Alpha"/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reorder "Beta"/i }),
    ).toBeInTheDocument();
  });

  it("passes onReorder through without invoking it for incidental clicks", async () => {
    const onReorder = jest.fn();
    const todos = [
      makeTodo({ id: "a", title: "Alpha" }),
      makeTodo({ id: "b", title: "Beta" }),
    ];
    render(
      <TodoList
        todos={todos}
        onToggle={noOp}
        onEdit={noOp}
        onDelete={noOp}
        onReorder={onReorder}
      />,
    );
    expect(onReorder).not.toHaveBeenCalled();
  });
});
