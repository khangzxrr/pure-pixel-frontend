const KEY = "changelogLastSeenAt";

// the store reads localStorage when the module loads, so each test imports a fresh copy
const loadStore = async () => {
  vi.resetModules();
  return (await import("./UseChangeLogStore")).default;
};

describe("UseChangeLogStore", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("starts from the value saved in localStorage", async () => {
    window.localStorage.setItem(KEY, "2026-09-01T00:00:00.000Z");
    const store = await loadStore();
    expect(store.getState().lastSeenAt).toBe("2026-09-01T00:00:00.000Z");
  });

  it("starts empty when localStorage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const store = await loadStore();
    expect(store.getState().lastSeenAt).toBeNull();
  });

  it("markSeen saves and updates the state", async () => {
    const store = await loadStore();
    store.getState().markSeen("2026-09-15T00:00:00.000Z");
    expect(store.getState().lastSeenAt).toBe("2026-09-15T00:00:00.000Z");
    expect(window.localStorage.getItem(KEY)).toBe("2026-09-15T00:00:00.000Z");
  });

  it("markSeen still updates the state when saving fails", async () => {
    const store = await loadStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    store.getState().markSeen("2026-09-15T00:00:00.000Z");
    expect(store.getState().lastSeenAt).toBe("2026-09-15T00:00:00.000Z");
    expect(log).toHaveBeenCalled();
  });
});
