import { ValidationError } from "yup";
import { PhotoshootPackageYup } from "./PhotoshootPackageYup";

const valid = {
  title: "Cưới",
  subtitle: "Trọn gói",
  price: "1.500.000",
  description: "Chụp cả ngày",
};

const errorsOf = (value: object) =>
  PhotoshootPackageYup.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

describe("PhotoshootPackageYup", () => {
  it("accepts a package and parses the formatted price", async () => {
    await expect(PhotoshootPackageYup.validate(valid)).resolves.toEqual({
      ...valid,
      price: 1500000,
    });
  });

  it("keeps a numeric price as is", async () => {
    await expect(
      PhotoshootPackageYup.validate({ ...valid, price: 20000 }),
    ).resolves.toMatchObject({ price: 20000 });
  });

  it.each([
    ["title is missing", { title: "" }, "Vui lòng nhập tiêu đề."],
    ["subtitle is missing", { subtitle: "" }, "Vui lòng nhập phụ đề."],
    ["price is missing", { price: undefined }, "Giá gói là bắt buộc"],
    ["price is not a number", { price: "abc" }, "Giá gói là bắt buộc"],
    ["price has the wrong type", { price: true }, "Giá gói phải là số"],
    ["price is too low", { price: "9.999" }, "Giá gói ít nhất là 10.000đ"],
    ["price is too high", { price: 100000001 }, "Giá gói phải ít hơn 100 triệu"],
    ["description is missing", { description: "" }, "Vui lòng nhập mô tả."],
    [
      "description is too long",
      { description: "a".repeat(1001) },
      "Mô tả của gói quá dài ",
    ],
  ])("rejects when %s", async (_case, override, message) => {
    await expect(errorsOf({ ...valid, ...override })).resolves.toEqual([
      message,
    ]);
  });
});
