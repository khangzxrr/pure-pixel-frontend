import calculateDateDifference from "./calculateDateDifference";

describe("calculateDateDifference", () => {
  const now = new Date(2026, 8, 15, 12, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ago = (ms: number) => new Date(now.getTime() - ms);
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it("treats a missing date as just now", () => {
    expect(calculateDateDifference(undefined)).toBe("vừa xong");
    expect(calculateDateDifference(null)).toBe("vừa xong");
  });

  it("treats a future date as just now", () => {
    expect(calculateDateDifference(new Date(now.getTime() + HOUR))).toBe(
      "vừa xong",
    );
  });

  it("treats anything under two minutes as just now", () => {
    expect(calculateDateDifference(ago(MINUTE))).toBe("vừa xong");
  });

  it("counts minutes under an hour", () => {
    expect(calculateDateDifference(ago(5 * MINUTE))).toBe("5 phút trước");
  });

  it("counts hours under a day", () => {
    expect(calculateDateDifference(ago(3 * HOUR + 10 * MINUTE))).toBe(
      "3 giờ trước",
    );
  });

  it("counts days under thirty days", () => {
    expect(calculateDateDifference(ago(4 * DAY).toISOString())).toBe(
      "4 ngày trước",
    );
  });

  it("formats older dates as HH:mm-DD-MM-YYYY", () => {
    expect(calculateDateDifference(new Date(2026, 0, 2, 3, 4))).toBe(
      "03:04-02-01-2026",
    );
  });
});
