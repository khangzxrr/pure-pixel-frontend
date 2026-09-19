import { ValidationError } from "yup";
import { uploadPhotoSellInput } from "./UploadPhotoSellInput";

const valid = {
  title: "Hoàng hôn",
  pricetags: [{ price: "50.000" }, { price: undefined }],
};

const errorsOf = (value: object) =>
  uploadPhotoSellInput.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

const AT_LEAST_ONE = "Yêu cầu có giá tiền cho ít nhất một kích cỡ ảnh bán";

describe("uploadPhotoSellInput", () => {
  it("accepts a photo with one priced size and parses formatted prices", async () => {
    await expect(uploadPhotoSellInput.validate(valid)).resolves.toMatchObject({
      pricetags: [{ price: 50000 }, {}],
    });
  });

  it("accepts every optional field, numeric prices and free sizes", async () => {
    await expect(
      errorsOf({
        ...valid,
        description: "Biển Nha Trang",
        categoryIds: ["cat1"],
        photoTags: ["biển"],
        location: "Nha Trang",
        pricetags: [{ price: 0 }, { price: 100000000 }, { price: "abc" }],
      }),
    ).resolves.toEqual([]);
  });

  it.each([
    ["title is missing", { title: "" }, ["Yêu cầu nhập tiêu đề"]],
    [
      "description is too long",
      { description: "a".repeat(1001) },
      ["Mô tả của bạn quá dài"],
    ],
    [
      "description contains a phone number",
      { description: "Gọi 0901234567" },
      ["Mô tả không được chứa số điện thoại"],
    ],
    [
      "a price is below 1,000",
      { pricetags: [{ price: 50000 }, { price: "500" }] },
      ["Giá phải từ 1,000vnđ trở lên"],
    ],
    [
      "a price is above 100 million",
      { pricetags: [{ price: 100000001 }] },
      ["Giá không được vượt quá 100 triệu đồng"],
    ],
    ["price tags are missing", { pricetags: undefined }, [AT_LEAST_ONE]],
    ["no size has a price", { pricetags: [{ price: 0 }, {}] }, [AT_LEAST_ONE]],
  ])("rejects when %s", async (_case, override, messages) => {
    await expect(errorsOf({ ...valid, ...override })).resolves.toEqual(
      messages,
    );
  });
});
