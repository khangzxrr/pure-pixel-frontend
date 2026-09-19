import { ValidationError } from "yup";
import { photoShootInput } from "./PhotoShootInput";

const errorsOf = (value: object) =>
  photoShootInput.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

const START_CHECK =
  "Ngày bắt đầu phải sau ngày hiện tại phải trên 24 giờ trở đi";
const END_CHECK = "Ngày kết thúc phải sau ngày bắt đầu ít nhất 3 giờ";

describe("photoShootInput", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 15, 8, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a range starting after 24 hours and lasting 3 hours", async () => {
    await expect(
      errorsOf({
        dateRange: [new Date(2026, 8, 17, 8, 0), new Date(2026, 8, 17, 11, 0)],
        description: "Chụp gia đình",
      }),
    ).resolves.toEqual([]);
  });

  it("requires the date range", async () => {
    await expect(errorsOf({})).resolves.toEqual([
      "Khoảng thời gian là bắt buộc",
    ]);
  });

  it("requires both dates", async () => {
    await expect(
      errorsOf({ dateRange: [new Date(2026, 8, 17, 8, 0)] }),
    ).resolves.toEqual([
      "Bạn cần chọn cả ngày bắt đầu và ngày kết thúc",
      END_CHECK,
    ]);
  });

  it("requires every date to be set", async () => {
    await expect(
      errorsOf({ dateRange: [new Date(2026, 8, 17, 8, 0), null] }),
    ).resolves.toEqual(
      expect.arrayContaining(["Ngày là bắt buộc", END_CHECK]),
    );
  });

  it("rejects a start within the next 24 hours", async () => {
    await expect(
      errorsOf({
        dateRange: [new Date(2026, 8, 16, 7, 0), new Date(2026, 8, 16, 12, 0)],
      }),
    ).resolves.toEqual([START_CHECK]);
  });

  it("rejects an end less than 3 hours after the start", async () => {
    await expect(
      errorsOf({
        dateRange: [new Date(2026, 8, 17, 8, 0), new Date(2026, 8, 17, 10, 59)],
      }),
    ).resolves.toEqual([END_CHECK]);
  });

  it("rejects a description over 1000 characters", async () => {
    await expect(
      errorsOf({
        dateRange: [new Date(2026, 8, 17, 8, 0), new Date(2026, 8, 17, 11, 0)],
        description: "a".repeat(1001),
      }),
    ).resolves.toEqual(["Mô tả của gói quá dài "]);
  });
});
