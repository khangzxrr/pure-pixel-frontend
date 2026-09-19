import { ValidationError } from "yup";
import { updatePhotoInputSchema } from "./UpdatePhotoInput";

const valid = { title: "Hoàng hôn", visibility: "PUBLIC" };

const errorsOf = (value: object) =>
  updatePhotoInputSchema.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

describe("updatePhotoInputSchema", () => {
  it("accepts the required fields alone", async () => {
    await expect(errorsOf(valid)).resolves.toEqual([]);
  });

  it("accepts every optional field", async () => {
    await expect(
      errorsOf({
        ...valid,
        description: "Biển Nha Trang",
        categoryIds: ["cat1"],
        photoTags: ["biển"],
        location: "Nha Trang",
        watermark: true,
      }),
    ).resolves.toEqual([]);
  });

  it.each([
    ["title is missing", { title: "" }, "Yêu cầu nhập tiêu đề"],
    ["visibility is missing", { visibility: "" }, "Yêu cầu chọn chế độ công khai"],
    [
      "description is too long",
      { description: "a".repeat(1001) },
      "Mô tả của bạn quá dài",
    ],
  ])("rejects when %s", async (_case, override, message) => {
    await expect(errorsOf({ ...valid, ...override })).resolves.toEqual([
      message,
    ]);
  });
});
