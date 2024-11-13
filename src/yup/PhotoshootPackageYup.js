import * as yup from "yup";

export const PhotoshootPackageYup = yup.object({
  title: yup.string().required("Vui lòng nhập tiêu đề."),
  subtitle: yup.string().required("Vui lòng nhập phụ đề."),
  price: yup
    .number()
    .typeError("Giá phải là một số.")
    .required("Vui lòng nhập giá.")
    .positive("Giá phải lớn hơn 0.")
    .min(10000, "Giá phải lớn hơn 10,000vnđ"), // Ensures price is more than 10,000
  description: yup
    .string()
    .required("Vui lòng nhập mô tả.")
    .max(1000, "Mô tả của bạn quá dài "), // Limits description to 1000 characters
});
