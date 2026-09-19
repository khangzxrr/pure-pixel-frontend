import { act, renderHook } from "@testing-library/react";
import { useModalState } from "./useModalState";
import { useTableState } from "./useTableState";

describe("useModalState", () => {
  it("starts closed by default and toggles", () => {
    const { result } = renderHook(() => useModalState());
    expect(result.current.isModalOpen).toBe(false);

    act(() => result.current.handleOpen());
    expect(result.current.isModalOpen).toBe(true);

    act(() => result.current.handleClose());
    expect(result.current.isModalOpen).toBe(false);
  });

  it("honours the initial state", () => {
    const { result } = renderHook(() => useModalState(true));
    expect(result.current.isModalOpen).toBe(true);
  });
});

describe("useTableState", () => {
  it("starts loading and toggles", () => {
    const { result } = renderHook(() => useTableState());
    expect(result.current.loading).toBe(true);

    act(() => result.current.handleCloseLoading());
    expect(result.current.loading).toBe(false);

    act(() => result.current.handleOpenLoading());
    expect(result.current.loading).toBe(true);
  });
});
