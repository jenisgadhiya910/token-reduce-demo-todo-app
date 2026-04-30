import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoFilter } from "./TodoFilter";
import type { Filter } from "@/lib/types";

type SetupOptions = {
  filter?: Filter;
  hasCompleted?: boolean;
  onFilterChange?: jest.Mock;
  onClearCompleted?: jest.Mock;
};

function setup(opts: SetupOptions = {}) {
  const {
    filter = "all",
    hasCompleted = false,
    onFilterChange = jest.fn(),
    onClearCompleted = jest.fn(),
  } = opts;

  const user = userEvent.setup();
  render(
    <TodoFilter
      filter={filter}
      onFilterChange={onFilterChange}
      hasCompleted={hasCompleted}
      onClearCompleted={onClearCompleted}
    />,
  );
  return { user, onFilterChange, onClearCompleted };
}

describe("TodoFilter — rendering", () => {
  it("renders All, Active, and Completed filter buttons", () => {
    setup();
    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Completed" })).toBeInTheDocument();
  });

  it("marks the current filter tab as selected", () => {
    setup({ filter: "active" });
    expect(screen.getByRole("tab", { name: "Active" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Completed" })).toHaveAttribute("aria-selected", "false");
  });

  it("renders the Clear completed button", () => {
    setup();
    expect(screen.getByRole("button", { name: /clear completed/i })).toBeInTheDocument();
  });

  it("disables Clear completed when hasCompleted is false", () => {
    setup({ hasCompleted: false });
    expect(screen.getByRole("button", { name: /clear completed/i })).toBeDisabled();
  });

  it("enables Clear completed when hasCompleted is true", () => {
    setup({ hasCompleted: true });
    expect(screen.getByRole("button", { name: /clear completed/i })).toBeEnabled();
  });
});

describe("TodoFilter — interactions", () => {
  it("calls onFilterChange with 'active' when the Active tab is clicked", async () => {
    const { user, onFilterChange } = setup({ filter: "all" });
    await user.click(screen.getByRole("tab", { name: "Active" }));
    expect(onFilterChange).toHaveBeenCalledWith("active");
  });

  it("calls onFilterChange with 'completed' when the Completed tab is clicked", async () => {
    const { user, onFilterChange } = setup({ filter: "all" });
    await user.click(screen.getByRole("tab", { name: "Completed" }));
    expect(onFilterChange).toHaveBeenCalledWith("completed");
  });

  it("calls onFilterChange with 'all' when the All tab is clicked", async () => {
    const { user, onFilterChange } = setup({ filter: "completed" });
    await user.click(screen.getByRole("tab", { name: "All" }));
    expect(onFilterChange).toHaveBeenCalledWith("all");
  });

  it("calls onClearCompleted when the Clear completed button is clicked and enabled", async () => {
    const { user, onClearCompleted } = setup({ hasCompleted: true });
    await user.click(screen.getByRole("button", { name: /clear completed/i }));
    expect(onClearCompleted).toHaveBeenCalledTimes(1);
  });

  it("does not call onClearCompleted when the button is disabled", async () => {
    const { user, onClearCompleted } = setup({ hasCompleted: false });
    await user.click(screen.getByRole("button", { name: /clear completed/i }));
    expect(onClearCompleted).not.toHaveBeenCalled();
  });
});
