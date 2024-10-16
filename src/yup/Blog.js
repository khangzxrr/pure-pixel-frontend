import * as yup from "yup";

export const BlogYup = yup.object({
    name: yup.string().trim().required("Vui lòng nhập tên blog"),
    content: yup.string().trim().required("Vui lòng nhập nội dung"),

  
});
