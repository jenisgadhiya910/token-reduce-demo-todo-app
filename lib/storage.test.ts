import { storage } from "./storage";
import type { Todo } from "./types";

const STORAGE_KEY = "todo-app:v1:todos";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "test-id-1",
    title: "Buy milk",
    completed: false,
    createdAt: 1000000,
    ...overrides,
  };
}

function mockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get _store() {
      return store;
    },
  };
}

describe("storage.read", () => {
  let ls: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    ls = mockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: ls,
      writable: true,
    });
  });

  it("returns an empty array when localStorage has no entry for the key", () => {
    expect(storage.read()).toEqual([]);
  });

  it("returns an empty array when the stored value is an empty JSON array", () => {
    ls.setItem(STORAGE_KEY, "[]");
    expect(storage.read()).toEqual([]);
  });

  it("returns persisted todos on a round-trip read", () => {
    const todos: Todo[] = [makeTodo()];
    ls.setItem(STORAGE_KEY, JSON.stringify(todos));
    expect(storage.read()).toEqual(todos);
  });

  it("returns an empty array when the JSON is malformed", () => {
    ls.setItem(STORAGE_KEY, "not-valid-json{{{");
    expect(storage.read()).toEqual([]);
  });

  it("returns an empty array when the stored value is a JSON object, not an array", () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ id: "x" }));
    expect(storage.read()).toEqual([]);
  });

  it("filters out entries that do not match the Todo shape", () => {
    const valid = makeTodo();
    const invalid = { id: 123, title: "bad", completed: false, createdAt: 1 };
    ls.setItem(STORAGE_KEY, JSON.stringify([valid, invalid]));
    expect(storage.read()).toEqual([valid]);
  });

  it("filters out entries missing required fields", () => {
    const valid = makeTodo();
    const missing = { id: "x", title: "no-completed", createdAt: 1 };
    ls.setItem(STORAGE_KEY, JSON.stringify([valid, missing]));
    expect(storage.read()).toEqual([valid]);
  });

  it("returns multiple valid todos preserving order", () => {
    const todos: Todo[] = [
      makeTodo({ id: "a", title: "First" }),
      makeTodo({ id: "b", title: "Second", completed: true }),
    ];
    ls.setItem(STORAGE_KEY, JSON.stringify(todos));
    expect(storage.read()).toEqual(todos);
  });
});

describe("storage.write", () => {
  let ls: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    ls = mockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: ls,
      writable: true,
    });
  });

  it("serializes todos to the correct storage key", () => {
    const todos: Todo[] = [makeTodo()];
    storage.write(todos);
    expect(ls._store[STORAGE_KEY]).toBe(JSON.stringify(todos));
  });

  it("writes an empty array as a valid JSON string", () => {
    storage.write([]);
    expect(ls._store[STORAGE_KEY]).toBe("[]");
  });

  it("overwrites the previous value on a second write", () => {
    const first: Todo[] = [makeTodo({ id: "a", title: "First" })];
    const second: Todo[] = [makeTodo({ id: "b", title: "Second" })];
    storage.write(first);
    storage.write(second);
    expect(ls._store[STORAGE_KEY]).toBe(JSON.stringify(second));
  });
});

describe("storage read/write round-trip", () => {
  let ls: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    ls = mockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: ls,
      writable: true,
    });
  });

  it("reads back exactly what was written", () => {
    const todos: Todo[] = [
      makeTodo({ id: "1", title: "Task one" }),
      makeTodo({ id: "2", title: "Task two", completed: true }),
    ];
    storage.write(todos);
    expect(storage.read()).toEqual(todos);
  });
});

describe("storage SSR guard", () => {
  it("read() returns an empty array when localStorage is not available", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    try {
      expect(storage.read()).toEqual([]);
    } finally {
      Object.defineProperty(window, "localStorage", {
        value: original,
        writable: true,
        configurable: true,
      });
    }
  });

  it("read() handles a getItem that throws and returns an empty array", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => {
          throw new Error("SecurityError: access denied");
        },
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
      configurable: true,
    });
    try {
      expect(storage.read()).toEqual([]);
    } finally {
      Object.defineProperty(window, "localStorage", {
        value: original,
        writable: true,
        configurable: true,
      });
    }
  });

  it("write() does not throw when setItem throws (quota exceeded simulation)", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
      configurable: true,
    });
    try {
      expect(() => storage.write([makeTodo()])).not.toThrow();
    } finally {
      Object.defineProperty(window, "localStorage", {
        value: original,
        writable: true,
        configurable: true,
      });
    }
  });
});
