import calculateRemainingTime from "./calculateRemainingTime";

describe("calculateRemainingTime", () => {
  const now = new Date("2026-09-15T12:00:00Z");
  const DAY = 24 * 60 * 60 * 1000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rounds a partial day up", () => {
    expect(calculateRemainingTime(now.getTime() + 2.5 * DAY)).toBe(3);
  });

  it("accepts ISO strings", () => {
    expect(calculateRemainingTime("2026-09-25T12:00:00Z")).toBe(10);
  });

  it("returns 0 once expired", () => {
    expect(calculateRemainingTime(new Date(now.getTime() - DAY))).toBe(0);
  });
});
