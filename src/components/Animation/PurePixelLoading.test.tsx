import { act, render } from "@testing-library/react";
import PurePixelLoading from "./PurePixelLoading";

const createContext = () => ({
  font: "",
  lineWidth: 0,
  globalAlpha: 0,
  strokeStyle: "",
  fillStyle: "",
  clearRect: vi.fn(),
  setLineDash: vi.fn(),
  strokeText: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
});

describe("PurePixelLoading", () => {
  let frames: FrameRequestCallback[];

  const mockContext = (context: ReturnType<typeof createContext> | null) =>
    vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(
        (() => context) as unknown as HTMLCanvasElement["getContext"],
      );

  const runFrames = () => {
    while (frames.length > 0) {
      frames.shift()?.(0);
    }
  };

  beforeEach(() => {
    vi.useFakeTimers();
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    // no random jitter between letters
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the canvas", () => {
    mockContext(createContext());
    const { container } = render(<PurePixelLoading />);

    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("width", "500");
    expect(canvas).toHaveAttribute("height", "500");
    expect(container.querySelector(".fancy_title")).toHaveAttribute(
      "id",
      "test",
    );
  });

  it("draws Pure Pixel letter by letter, then restarts", () => {
    const context = createContext();
    mockContext(context);
    render(<PurePixelLoading />);

    expect(context.font).toBe("80px Charm");
    expect(context.lineWidth).toBe(1);
    expect(context.globalAlpha).toBeCloseTo(2 / 3);
    expect(context.strokeStyle).toBe("#FFF");
    expect(context.fillStyle).toBe("#FFF");
    // the first stroke of the first letter happens immediately
    expect(context.strokeText).toHaveBeenCalledWith("P", 30, 90);
    expect(context.setLineDash).toHaveBeenCalledWith([0, 207]);

    runFrames();

    const filled = context.fillText.mock.calls.map(([letter]) => letter);
    expect(filled.join("")).toBe("Pure Pixel");
    // each letter advances by its measured width plus the line width jitter
    expect(context.fillText).toHaveBeenNthCalledWith(1, "P", 30, 90);
    expect(context.fillText).toHaveBeenNthCalledWith(2, "u", 40, 90);
    // 220 / 13 → 17 strokes per letter
    expect(context.strokeText).toHaveBeenCalledTimes(170);

    context.strokeText.mockClear();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(context.clearRect).toHaveBeenLastCalledWith(30, 0, 60, 150);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 640, 100);
    expect(context.strokeText).toHaveBeenCalledWith("P", 30, 90);
  });

  it("does nothing without a 2D context", () => {
    mockContext(null);
    const { container } = render(<PurePixelLoading />);

    expect(container.querySelector("canvas")).toBeInTheDocument();
    expect(frames).toHaveLength(0);
  });
});
