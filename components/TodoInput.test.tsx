import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoInput } from "./TodoInput";

function setup(onAdd = jest.fn()) {
  const user = userEvent.setup();
  render(<TodoInput onAdd={onAdd} />);
  return { user, onAdd, input: screen.getByRole("textbox", { name: /new todo/i }) };
}

describe("TodoInput", () => {
  it("renders the text input and Add button", () => {
    setup();
    expect(screen.getByRole("textbox", { name: /new todo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("Add button is disabled when input is empty", () => {
    setup();
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("Add button is disabled when input contains only whitespace", async () => {
    const { user, input } = setup();
    await user.type(input, "   ");
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("Add button becomes enabled when the user types a non-blank title", async () => {
    const { user, input } = setup();
    await user.type(input, "Buy coffee");
    expect(screen.getByRole("button", { name: /add/i })).toBeEnabled();
  });

  it("calls onAdd with the trimmed title when the form is submitted via Enter", async () => {
    const { user, input, onAdd } = setup();
    await user.type(input, "New todo{Enter}");
    expect(onAdd).toHaveBeenCalledWith("New todo");
  });

  it("calls onAdd with the trimmed title when the Add button is clicked", async () => {
    const { user, input, onAdd } = setup();
    await user.type(input, "  Click add  ");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith("Click add");
  });

  it("clears the input after a successful submission", async () => {
    const { user, input } = setup();
    await user.type(input, "Task{Enter}");
    expect(input).toHaveValue("");
  });

  it("does not call onAdd when Enter is pressed on an empty input", async () => {
    const { user, input, onAdd } = setup();
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not clear the input when Enter is pressed on a whitespace-only value", async () => {
    const { user, input, onAdd } = setup();
    await user.type(input, "   {Enter}");
    expect(onAdd).not.toHaveBeenCalled();
    expect(input).toHaveValue("   ");
  });
});
