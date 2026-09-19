import { ValidationError } from "yup";
import billItemSchema from "./BillItemInput";

const valid = { type: "INCREASE", title: "Thêm giờ", price: "50.000" };

const errorsOf = (value: object) =>
  billItemSchema.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

describe("billItemSchema", () => {
  it("accepts a bill item and parses the formatted price", async () => {
    await expect(billItemSchema.validate(valid)).resolves.toEqual({
      type: "INCREASE",
      title: "Thêm giờ",
      price: 50000,
    });
  });

  it("keeps a numeric price as is", async () => {
    await expect(
      billItemSchema.validate({ ...valid, type: "DECREASE", price: 20000 }),
    ).resolves.toMatchObject({ price: 20000 });
  });

  it.each([
    ["type is missing", { type: undefined }, "Loại là bắt buộc"],
    ["type is unknown", { type: "OTHER" }, "Loại không hợp lệ"],
    ["title is missing", { title: "" }, "Tiêu đề là bắt buộc"],
    ["title is too long", { title: "a".repeat(51) }, "Tiêu đề quá dài"],
    ["price is missing", { price: undefined }, "Giá là bắt buộc"],
    ["price is not a number", { price: "abc" }, "Giá là bắt buộc"],
    ["price has the wrong type", { price: true }, "Giá phải là số"],
    ["price is too low", { price: "9.999" }, "Giá ít nhất là 10.000đ"],
    ["price is too high", { price: 10000000001 }, "Giá phải ít hơn 10 tỷ đồng"],
  ])("rejects when %s", async (_case, override, message) => {
    await expect(errorsOf({ ...valid, ...override })).resolves.toEqual([
      message,
    ]);
  });
});
