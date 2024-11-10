import * as yup from "yup";

// Define validation schema
export const updateProfileInputSchema = yup.object().shape({
  name: yup.string().required("Tên là bắt buộc"),
  quote: yup.string().max(90, "Tiểu sử không được vượt quá 90 ký tự"),
  mail: yup.string().email("Email chưa hợp lệ"),
  // .required("Email là bắt buộc"),
  phonenumber: yup
    .string()
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, "Số điện thoại chưa hợp lệ"),
  // .required("Số điện thoại là bắt buộc"),
  location: yup.string(),
  // Add other fields as needed
});
