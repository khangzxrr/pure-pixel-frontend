import { ValidationError } from "yup";
import { uploadPhotoInputSchema } from "./UploadPhotoInput";

const valid = { title: "Hoàng hôn", visibility: "PUBLIC" };

const errorsOf = (value: object) =>
  uploadPhotoInputSchema.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

describe("uploadPhotoInputSchema", () => {
  it.each([
    ["the required fields alone", valid],
    ["no watermark without watermark content", { ...valid, watermark: false }],
    [
      "every field",
      {
        ...valid,
        description: "Biển Nha Trang lúc 5 giờ",
        categoryIds: ["cat1"],
        photoTags: ["biển"],
        location: "Nha Trang",
        watermark: true,
        watermarkContent: "PurePixel",
        showExif: true,
      },
    ],
  ])("accepts %s", async (_case, value) => {
    await expect(errorsOf(value)).resolves.toEqual([]);
  });

  it.each([
    ["title is missing", { title: "" }, "Yêu cầu nhập tiêu đề"],
    ["visibility is missing", { visibility: "" }, "Yêu cầu chọn chế độ công khai"],
    [
      "description is too long",
      { description: "a".repeat(1001) },
      "Mô tả của bạn quá dài",
    ],
    [
      "description contains a phone number",
      { description: "Liên hệ 0901234567" },
      "Mô tả không được chứa số điện thoại",
    ],
    [
      "a watermark has no content",
      { watermark: true, watermarkContent: "" },
      "Nội dung nhãn không được để trống khi gắn nhãn",
    ],
  ])("rejects when %s", async (_case, override, message) => {
    await expect(errorsOf({ ...valid, ...override })).resolves.toEqual([
      message,
    ]);
  });
});
