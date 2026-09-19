import { act, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import type { FireworksHandlers, FireworksOptions } from "@fireworks-js/react";
import useFireworkStore from "../../states/UseFireworkStore";
import { Firework } from "./Firework";

const fireworks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  props: [] as { options?: FireworksOptions; style?: CSSProperties }[],
}));

vi.mock("@fireworks-js/react", async () => {
  const { forwardRef, useImperativeHandle } = await import("react");
  type StubProps = { options?: FireworksOptions; style?: CSSProperties };
  const Fireworks = forwardRef<FireworksHandlers, StubProps>((props, ref) => {
    useImperativeHandle(
      ref,
      () =>
        ({
          start: fireworks.start,
          stop: fireworks.stop,
        }) as unknown as FireworksHandlers,
    );
    fireworks.props.push(props);
    return <div data-testid="fireworks" />;
  });
  Fireworks.displayName = "Fireworks";
  return { Fireworks };
});

describe("Firework", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fireworks.start.mockClear();
    fireworks.stop.mockClear();
    fireworks.props.length = 0;
    useFireworkStore.setState({ isFiring: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing until fireworks start", () => {
    const { container } = render(<Firework />);
    expect(container).toBeEmptyDOMElement();
    expect(fireworks.start).not.toHaveBeenCalled();
  });

  it("shows a full-screen show and stops it after three seconds", () => {
    render(<Firework />);

    act(() => {
      useFireworkStore.getState().startFireworks();
    });

    expect(screen.getByTestId("fireworks")).toBeInTheDocument();
    expect(fireworks.start).toHaveBeenCalledTimes(1);
    expect(fireworks.props.at(-1)).toEqual({
      options: { opacity: 0.5 },
      style: {
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
      },
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(fireworks.stop).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(fireworks.stop).toHaveBeenCalledTimes(1);
    expect(useFireworkStore.getState().isFiring).toBe(false);
    expect(screen.queryByTestId("fireworks")).toBeNull();
  });

  it("cancels the pending stop when unmounted", () => {
    const { unmount } = render(<Firework />);
    act(() => {
      useFireworkStore.getState().startFireworks();
    });

    unmount();
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(fireworks.stop).not.toHaveBeenCalled();
    expect(useFireworkStore.getState().isFiring).toBe(true);
  });
});
