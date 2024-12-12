import * as yup from "yup";

export const PhotoshootPackageYup = yup.object({
  title: yup.string().required("Vui lòng nhập tiêu đề."),
  subtitle: yup.string().required("Vui lòng nhập phụ đề."),
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
    .typeError("Giá gói phải là số")
    .required("Giá gói là bắt buộc")
    .min(10000, "Giá gói ít nhất là 10.000đ") // Minimum price validation
    .max(100000000, "Giá gói phải ít hơn 100 triệu"), // Maximum price validation
  description: yup
    .string()
    .required("Vui lòng nhập mô tả.")
    .max(1000, "Mô tả của gói quá dài "), // Limits description to 1000 characters
});
