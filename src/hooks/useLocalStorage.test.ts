import { act, renderHook } from "@testing-library/react";
import { useStorage } from "./useLocalStorage";

describe("useStorage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("uses the initial value and saves it", () => {
    const { result } = renderHook(() => useStorage("flag", false));
    expect(result.current[0]).toBe(false);
    expect(window.localStorage.getItem("flag")).toBe("false");
  });

  it("reads an existing value", () => {
    window.localStorage.setItem("prefs", JSON.stringify({ theme: "dark" }));
    const { result } = renderHook(() => useStorage("prefs", { theme: "" }));
    expect(result.current[0]).toEqual({ theme: "dark" });
  });

  it("writes updates back to localStorage", () => {
    const { result } = renderHook(() => useStorage("count", 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem("count")).toBe("5");
  });

  it("reloads a value changed elsewhere", () => {
    const { result } = renderHook(() => useStorage("count", 0));
    window.localStorage.setItem("count", "9");
    act(() => result.current[2]());
    expect(result.current[0]).toBe(9);
  });

  it("keeps the current value when there is nothing to reload", () => {
    const { result } = renderHook(() => useStorage("count", 3));
    window.localStorage.removeItem("count");
    act(() => result.current[2]());
    expect(result.current[0]).toBe(3);
  });

  it("falls back to the initial value when stored JSON is broken", () => {
    window.localStorage.setItem("broken", "{nope");
    const { result } = renderHook(() => useStorage("broken", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("logs instead of throwing when storage is unavailable", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderHook(() => useStorage("count", 1));

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    act(() => result.current[2]());

    expect(result.current[0]).toBe(1);
    expect(log).toHaveBeenCalledTimes(2);
  });
});
