import * as yup from "yup";

export const PhotoshootPackageYup = yup.object({
    title: yup.string().required("Vui lòng nhập tiêu đề."),
    subtitle: yup.string().required("Vui lòng nhập phụ đề."),
    price: yup
        .number()
        .typeError("Giá phải là một số.")
        .required("Vui lòng nhập giá.")
        .positive("Giá phải lớn hơn 0."),
    description: yup.string().required("Vui lòng nhập mô tả."),
  
});
