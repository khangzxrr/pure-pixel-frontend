import { render, screen } from "@testing-library/react";
import { act } from "react";
import CountDownTimerForProductPhotoDetail from "./CountDownTimerForProductPhotoDetail";

describe("CountDownTimerForProductPhotoDetail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("counts down from five minutes to zero and stops there", () => {
    render(<CountDownTimerForProductPhotoDetail />);

    expect(screen.getByText(/05:00$/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/04:59$/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(299000);
    });
    expect(screen.getByText(/00:00$/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/00:00$/)).toBeInTheDocument();
  });
});
