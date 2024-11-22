import * as yup from "yup";

export const CameraYup = yup.object({
    name: yup.string().trim().required("Vui lòng nhập tên"),
    // content: yup.string().trim().required("Vui lòng nhập nội dung"),

  
});
