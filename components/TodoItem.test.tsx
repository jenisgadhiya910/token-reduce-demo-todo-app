import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "item-1",
    title: "Test todo",
    completed: false,
    createdAt: 1000000,
    ...overrides,
  };
}

type Handlers = {
  onToggle: jest.Mock;
  onEdit: jest.Mock;
  onDelete: jest.Mock;
};

function setup(todo: Todo, handlers?: Partial<Handlers>) {
  const merged: Handlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    ...handlers,
  };
  const user = userEvent.setup();
  render(
    <TodoItem
      todo={todo}
      onToggle={merged.onToggle}
      onEdit={merged.onEdit}
      onDelete={merged.onDelete}
    />,
  );
  return { user, ...merged };
}

describe("TodoItem — rendering", () => {
  it("renders the todo title", () => {
    setup(makeTodo({ title: "Buy bread" }));
    expect(screen.getByText("Buy bread")).toBeInTheDocument();
  });

  it("renders the checkbox as unchecked for an incomplete todo", () => {
    setup(makeTodo({ completed: false }));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders the checkbox as checked for a completed todo", () => {
    setup(makeTodo({ completed: true }));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders Edit and Delete buttons", () => {
    const todo = makeTodo({ title: "My task" });
    setup(todo);
    expect(screen.getByRole("button", { name: /edit "My task"/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete "My task"/i })).toBeInTheDocument();
  });
});

describe("TodoItem — toggle", () => {
  it("calls onToggle with the todo id when the checkbox is clicked", async () => {
    const todo = makeTodo({ id: "toggle-1" });
    const { user, onToggle } = setup(todo);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("toggle-1");
  });
});

describe("TodoItem — delete", () => {
  it("calls onDelete with the todo id when the Delete button is clicked", async () => {
    const todo = makeTodo({ id: "del-1", title: "Delete me" });
    const { user, onDelete } = setup(todo);
    await user.click(screen.getByRole("button", { name: /delete "Delete me"/i }));
    expect(onDelete).toHaveBeenCalledWith("del-1");
  });
});

describe("TodoItem — edit mode entry", () => {
  it("enters edit mode when the Edit button is clicked", async () => {
    const todo = makeTodo({ title: "Editable" });
    const { user } = setup(todo);
    await user.click(screen.getByRole("button", { name: /edit "Editable"/i }));
    expect(screen.getByRole("textbox", { name: /edit todo/i })).toBeInTheDocument();
  });

  it("enters edit mode when the label is double-clicked", async () => {
    const todo = makeTodo({ title: "Double click me" });
    const { user } = setup(todo);
    await user.dblClick(screen.getByText("Double click me"));
    expect(screen.getByRole("textbox", { name: /edit todo/i })).toBeInTheDocument();
  });

  it("pre-fills the edit input with the current title", async () => {
    const todo = makeTodo({ title: "Pre-filled" });
    const { user } = setup(todo);
    await user.click(screen.getByRole("button", { name: /edit "Pre-filled"/i }));
    expect(screen.getByRole("textbox", { name: /edit todo/i })).toHaveValue("Pre-filled");
  });
});

describe("TodoItem — edit mode save", () => {
  it("calls onEdit with the new title when Enter is pressed", async () => {
    const todo = makeTodo({ id: "edit-1", title: "Original" });
    const { user, onEdit } = setup(todo);
    await user.click(screen.getByRole("button", { name: /edit "Original"/i }));
    const editInput = screen.getByRole("textbox", { name: /edit todo/i });
    await user.clear(editInput);
    await user.type(editInput, "Updated{Enter}");
    expect(onEdit).toHaveBeenCalledWith("edit-1", "Updated");
  });

  it("exits edit mode after saving with Enter", async () => {
    const todo = makeTodo({ title: "Original" });
    const { user } = setup(todo);
    await user.click(screen.getByRole("button", { name: /edit "Original"/i }));
    const editInput = screen.getByRole("textbox", { name: /edit todo/i });
    await user.clear(editInput);
    await user.type(editInput, "Changed{Enter}");
    expect(screen.queryByRole("textbox", { name: /edit todo/i })).not.toBeInTheDocument();
  });

  it("does not call onEdit when the title is unchanged", async () => {
    const todo = makeTodo({ id: "edit-2", title: "Same" });
    const { user, onEdit } = setup(todo);
    await user.click(screen.getByRole("button", { name: /edit "Same"/i }));
    const editInput = screen.getByRole("textbox", { name: /edit todo/i });
    await user.type(editInput, "{Enter}");
    expect(onEdit).not.toHaveBeenCalled();
  });
});

describe("TodoItem — edit mode cancel", () => {
  it("exits edit mode without calling onEdit when Escape is pressed", async () => {
    const todo = makeTodo({ title: "Cancel me" });
    const { user, onEdit } = setup(todo);
    await user.click(screen.getByRole("button", { name: /edit "Cancel me"/i }));
    const editInput = screen.getByRole("textbox", { name: /edit todo/i });
    await user.clear(editInput);
    await user.type(editInput, "Draft{Escape}");
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox", { name: /edit todo/i })).not.toBeInTheDocument();
  });
});
