import { bytesToGigabytes } from "./bytesToGigabytes";
import { FormatDate } from "./FormatDate";
import { FormatDateTime } from "./FormatDateTimeUtils";
import formatPrice from "./FormatPriceUtils";

describe("FormatDate", () => {
  it("formats as DD/MM/YYYY in Vietnamese locale", () => {
    expect(FormatDate(new Date(2026, 0, 2, 12, 0))).toBe("02/01/2026");
  });
});

describe("FormatDateTime", () => {
  it("includes a 24-hour time", () => {
    const formatted = FormatDateTime(new Date(2026, 0, 2, 15, 4));
    expect(formatted).toContain("15:04");
    expect(formatted).toContain("02/01/2026");
  });
});

describe("formatPrice", () => {
  it("groups thousands with dots and appends the currency", () => {
    expect(formatPrice(1234567)).toBe("1.234.567đ");
    expect(formatPrice("50000")).toBe("50.000đ");
  });

  it("keeps the old output for a missing price", () => {
    expect(formatPrice(undefined)).toBe("undefinedđ");
  });
});

describe("bytesToGigabytes", () => {
  it("converts to two decimals", () => {
    expect(bytesToGigabytes(1024 * 1024 * 1024 * 1.5)).toBe("1.50");
  });

  it("returns 0 for zero bytes", () => {
    expect(bytesToGigabytes(0)).toBe("0");
  });

  it("rejects missing or non-numeric input", () => {
    expect(bytesToGigabytes(undefined)).toBe("Invalid input");
    expect(bytesToGigabytes("abc")).toBe("Invalid input");
  });
});
