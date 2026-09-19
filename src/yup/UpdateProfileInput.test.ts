import { ValidationError } from "yup";
import { updateProfileInputSchema } from "./UpdateProfileInput";

const errorsOf = (value: object) =>
  updateProfileInputSchema.validate(value, { abortEarly: false }).then(
    () => [],
    (error: ValidationError) => error.errors,
  );

describe("updateProfileInputSchema", () => {
  it.each([
    ["only a name", { name: "An" }],
    ["an empty phone number", { name: "An", phonenumber: "" }],
    [
      "every field",
      {
        name: "An",
        quote: "Chụp mỗi ngày",
        mail: "an@example.com",
        phonenumber: "0901234567",
        location: "Huế",
      },
    ],
  ])("accepts %s", async (_case, value) => {
    await expect(errorsOf(value)).resolves.toEqual([]);
  });

  it.each([
    ["name is missing", { name: "" }, "Tên là bắt buộc"],
    [
      "quote is too long",
      { quote: "a".repeat(91) },
      "Tiểu sử không được vượt quá 90 ký tự",
    ],
    ["mail is invalid", { mail: "an@" }, "Email chưa hợp lệ"],
    ["phone number is invalid", { phonenumber: "12345" }, "Số điện thoại chưa hợp lệ"],
  ])("rejects when %s", async (_case, override, message) => {
    await expect(errorsOf({ name: "An", ...override })).resolves.toEqual([
      message,
    ]);
  });
});
