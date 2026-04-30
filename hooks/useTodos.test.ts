import { act, renderHook } from "@testing-library/react";
import { useTodos } from "./useTodos";
import { storage } from "@/lib/storage";
import type { Todo } from "@/lib/types";

jest.mock("@/lib/storage", () => ({
  storage: {
    read: jest.fn(),
    write: jest.fn(),
  },
}));

const mockRead = storage.read as jest.MockedFunction<typeof storage.read>;
const mockWrite = storage.write as jest.MockedFunction<typeof storage.write>;

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "fixed-id",
    title: "Test todo",
    completed: false,
    createdAt: 1000000,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRead.mockReturnValue([]);
  let uuidCounter = 0;
  jest.spyOn(crypto, "randomUUID").mockImplementation(
    () => `uuid-${++uuidCounter}` as `${string}-${string}-${string}-${string}-${string}`,
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useTodos — hydration", () => {
  it("is hydrated after mount and reads todos from storage", async () => {
    const stored: Todo[] = [makeTodo({ id: "s1", title: "Stored" })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    expect(result.current.hydrated).toBe(true);
    expect(result.current.todos).toEqual(stored);
    expect(mockRead).toHaveBeenCalledTimes(1);
  });

  it("hydrates with an empty array when storage is empty", async () => {
    mockRead.mockReturnValue([]);

    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    expect(result.current.hydrated).toBe(true);
    expect(result.current.todos).toEqual([]);
  });

  it("exposes hydrated: true and the stored list in the same render cycle", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "h1", title: "Alpha" }),
      makeTodo({ id: "h2", title: "Beta" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());

    await act(async () => {});

    expect(result.current.hydrated).toBe(true);
    expect(result.current.todos).toHaveLength(2);
  });
});

describe("useTodos — ADD action", () => {
  it("adds a new todo with the given title", async () => {
    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("New task"));

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("New task");
    expect(result.current.todos[0].completed).toBe(false);
  });

  it("assigns a unique id to a new todo", async () => {
    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("Task A"));
    act(() => result.current.add("Task B"));

    const ids = result.current.todos.map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("prepends new todos so the newest appears first", async () => {
    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("First"));
    act(() => result.current.add("Second"));

    expect(result.current.todos[0].title).toBe("Second");
    expect(result.current.todos[1].title).toBe("First");
  });

  it("trims whitespace before adding", async () => {
    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("  padded  "));

    expect(result.current.todos[0].title).toBe("padded");
  });

  it("does not add a todo when the title is blank", async () => {
    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("   "));

    expect(result.current.todos).toHaveLength(0);
  });
});

describe("useTodos — TOGGLE action", () => {
  it("marks an incomplete todo as completed", async () => {
    const stored: Todo[] = [makeTodo({ id: "t1", completed: false })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.toggle("t1"));

    expect(result.current.todos[0].completed).toBe(true);
  });

  it("marks a completed todo as incomplete", async () => {
    const stored: Todo[] = [makeTodo({ id: "t1", completed: true })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.toggle("t1"));

    expect(result.current.todos[0].completed).toBe(false);
  });

  it("only toggles the targeted todo when multiple exist", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "t1", title: "A", completed: false }),
      makeTodo({ id: "t2", title: "B", completed: false }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.toggle("t1"));

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.todos[1].completed).toBe(false);
  });
});

describe("useTodos — EDIT action", () => {
  it("updates the title of the targeted todo", async () => {
    const stored: Todo[] = [makeTodo({ id: "e1", title: "Old title" })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.edit("e1", "New title"));

    expect(result.current.todos[0].title).toBe("New title");
  });

  it("trims whitespace from the new title", async () => {
    const stored: Todo[] = [makeTodo({ id: "e1", title: "Original" })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.edit("e1", "  trimmed  "));

    expect(result.current.todos[0].title).toBe("trimmed");
  });

  it("deletes the todo when edited to a blank title", async () => {
    const stored: Todo[] = [makeTodo({ id: "e1", title: "Will be deleted" })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.edit("e1", "   "));

    expect(result.current.todos).toHaveLength(0);
  });

  it("does not affect other todos when editing one", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "e1", title: "A" }),
      makeTodo({ id: "e2", title: "B" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.edit("e1", "Updated A"));

    expect(result.current.todos[0].title).toBe("Updated A");
    expect(result.current.todos[1].title).toBe("B");
  });
});

describe("useTodos — DELETE action", () => {
  it("removes the targeted todo", async () => {
    const stored: Todo[] = [makeTodo({ id: "d1" })];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.remove("d1"));

    expect(result.current.todos).toHaveLength(0);
  });

  it("only removes the targeted todo when multiple exist", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "d1", title: "Keep" }),
      makeTodo({ id: "d2", title: "Remove" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.remove("d2"));

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe("d1");
  });
});

describe("useTodos — CLEAR_COMPLETED action", () => {
  it("removes all completed todos", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "c1", completed: true }),
      makeTodo({ id: "c2", completed: true }),
      makeTodo({ id: "c3", completed: false }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.clearCompleted());

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe("c3");
  });

  it("does nothing when no todos are completed", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "c1", completed: false }),
      makeTodo({ id: "c2", completed: false }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.clearCompleted());

    expect(result.current.todos).toHaveLength(2);
  });

  it("leaves the list empty when all todos are completed", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "c1", completed: true }),
      makeTodo({ id: "c2", completed: true }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.clearCompleted());

    expect(result.current.todos).toHaveLength(0);
  });
});

describe("useTodos — REORDER action", () => {
  it("moves an item from index A to index B", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "r1", title: "A" }),
      makeTodo({ id: "r2", title: "B" }),
      makeTodo({ id: "r3", title: "C" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.reorder(0, 2));

    expect(result.current.todos.map((t) => t.id)).toEqual(["r2", "r3", "r1"]);
  });

  it("moves backward as well as forward", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "r1", title: "A" }),
      makeTodo({ id: "r2", title: "B" }),
      makeTodo({ id: "r3", title: "C" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.reorder(2, 0));

    expect(result.current.todos.map((t) => t.id)).toEqual(["r3", "r1", "r2"]);
  });

  it("no-ops when from === to", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "r1" }),
      makeTodo({ id: "r2" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});
    const before = result.current.todos;

    act(() => result.current.reorder(1, 1));

    expect(result.current.todos).toBe(before);
  });

  it("ignores out-of-range indices", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "r1" }),
      makeTodo({ id: "r2" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});
    const before = result.current.todos;

    act(() => result.current.reorder(-1, 0));
    act(() => result.current.reorder(0, 99));
    act(() => result.current.reorder(5, 6));

    expect(result.current.todos).toBe(before);
  });

  it("persists the new order to storage", async () => {
    const stored: Todo[] = [
      makeTodo({ id: "r1", title: "A" }),
      makeTodo({ id: "r2", title: "B" }),
    ];
    mockRead.mockReturnValue(stored);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.reorder(0, 1));

    const lastWritten = mockWrite.mock.calls[mockWrite.mock.calls.length - 1][0];
    expect(lastWritten.map((t) => t.id)).toEqual(["r2", "r1"]);
  });
});

describe("useTodos — localStorage persistence", () => {
  it("calls storage.write after a state change post-hydration", async () => {
    mockRead.mockReturnValue([]);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("Persist me"));

    expect(mockWrite).toHaveBeenCalled();
    const lastCall = mockWrite.mock.calls[mockWrite.mock.calls.length - 1][0];
    expect(lastCall[0].title).toBe("Persist me");
  });

  it("does not call storage.write before hydration completes", () => {
    mockRead.mockReturnValue([]);
    renderHook(() => useTodos());
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("persists the latest todos list after multiple mutations", async () => {
    mockRead.mockReturnValue([]);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    act(() => result.current.add("First"));
    act(() => result.current.add("Second"));
    act(() => result.current.remove(result.current.todos[1].id));

    const lastWritten = mockWrite.mock.calls[mockWrite.mock.calls.length - 1][0];
    expect(lastWritten).toHaveLength(1);
    expect(lastWritten[0].title).toBe("Second");
  });
});
