import { act, render, screen } from "@testing-library/react";
import CountdownTimer from "./CountdownTimer";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const text = () => screen.getByText(/Thời gian hiệu lực còn/).textContent;

  it("starts at five minutes and counts down every second", () => {
    render(<CountdownTimer />);
    expect(text()).toBe("Thời gian hiệu lực còn: 05:00");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(text()).toBe("Thời gian hiệu lực còn: 04:59");

    act(() => {
      vi.advanceTimersByTime(59_000);
    });
    expect(text()).toBe("Thời gian hiệu lực còn: 04:00");
  });

  it("stops at zero", () => {
    const clear = vi.spyOn(globalThis, "clearInterval");
    render(<CountdownTimer />);

    act(() => {
      vi.advanceTimersByTime(300_000);
    });
    expect(text()).toBe("Thời gian hiệu lực còn: 00:00");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(text()).toBe("Thời gian hiệu lực còn: 00:00");
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });
});
