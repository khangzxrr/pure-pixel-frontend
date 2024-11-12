import * as yup from "yup";

const billItemSchema = yup.object().shape({
  type: yup
    .string()
    .required("Loại là bắt buộc")
    .oneOf(["INCREASE", "DECREASE"], "Loại không hợp lệ"),
  title: yup
    .string()
    .required("Tiêu đề là bắt buộc")
    .max(50, "Tiêu đề quá dài"), // Maximum length validation for title
  price: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        // Convert the value to a number
        const parsedValue = parseInt(originalValue.replace(/\./g, ""), 10);
        return isNaN(parsedValue) ? undefined : parsedValue;
      }
      return value;
    })
    .typeError("Giá phải là số")
    .required("Giá là bắt buộc")
    .min(10000, "Giá ít nhất là 10.000đ") // Minimum price validation
    .max(10000000000, "Giá phải ít hơn 10 tỷ đồng"), // Maximum price validation
});

export default billItemSchema;
