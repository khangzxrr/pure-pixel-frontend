import type ECommerceStore from "./UseECommerceStore";

// the store reads the current date when the module loads, so each test imports a fresh copy
const loadStore = async (): Promise<typeof ECommerceStore> => {
  vi.resetModules();
  return (await import("./UseECommerceStore")).default;
};

describe("UseECommerceStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts from 1 September 2024 until now", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 15, 10, 30));
    const store = await loadStore();
    expect(store.getState().fromDate).toEqual(new Date(2024, 8, 1));
    expect(store.getState().toDate).toEqual(new Date(2026, 8, 15, 10, 30));
  });

  it("setFromDateState and setToDateState replace the range", async () => {
    const store = await loadStore();
    store.getState().setFromDateState(new Date(2025, 0, 1));
    store.getState().setToDateState(new Date(2025, 5, 30));
    expect(store.getState().fromDate).toEqual(new Date(2025, 0, 1));
    expect(store.getState().toDate).toEqual(new Date(2025, 5, 30));
  });
});
