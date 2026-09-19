import { ValidationError } from "yup";
import { Upgrade } from "./Upgrade";

const valid = {
  name: " Nhiếp ảnh gia ",
  summary: "Bán ảnh và nhận lịch chụp",
  minOrderMonth: 1,
  maxPhotoQuota: 1000,
  maxPackageCount: 5,
  price: " 100000 ",
  descriptions: [" Bán ảnh "],
};

const errorsOf = (value: object) =>
  Upgrade.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

describe("Upgrade", () => {
  it("accepts a package and trims its texts", async () => {
    await expect(Upgrade.validate(valid)).resolves.toEqual({
      ...valid,
      name: "Nhiếp ảnh gia",
      price: "100000",
      descriptions: ["Bán ảnh"],
    });
  });

  it.each([
    ["name is blank", { name: "  " }, "Vui lòng nhập tên gói"],
    ["summary is blank", { summary: "  " }, "Vui lòng nhập bản tóm tắt"],
    ["minOrderMonth is missing", { minOrderMonth: undefined }, "Vui lòng chọn thời hạn"],
    ["minOrderMonth is not a number", { minOrderMonth: "abc" }, "Vui lòng chọn thời hạn"],
    ["maxPhotoQuota is missing", { maxPhotoQuota: undefined }, "Vui lòng chọn thời hạn"],
    ["maxPhotoQuota is not a number", { maxPhotoQuota: "abc" }, "Vui lòng chọn thời hạn"],
    ["maxPackageCount is missing", { maxPackageCount: undefined }, "Vui lòng chọn thời hạn"],
    ["maxPackageCount is not a number", { maxPackageCount: "abc" }, "Vui lòng chọn thời hạn"],
    ["price is missing", { price: undefined }, "Vui lòng nhập giá tiền"],
    ["price is null", { price: null }, "Vui lòng nhập giá tiền"],
    [
      "descriptions are missing",
      { descriptions: undefined },
      "Vui lòng nhập ít nhất một chi tiết gói nâng cấp",
    ],
    [
      "a description is blank",
      { descriptions: ["Bán ảnh", " "] },
      "Vui lòng nhập chi tiết gói nâng cấp",
    ],
  ])("rejects when %s", async (_case, override, message) => {
    await expect(errorsOf({ ...valid, ...override })).resolves.toEqual([
      message,
    ]);
  });
});
