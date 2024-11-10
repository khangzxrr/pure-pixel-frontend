import * as yup from "yup";

export const updatePhotoInputSchema = yup.object().shape({
  title: yup.string().required("Yêu cầu nhập tiêu đề"),
  description: yup.string().required("Yêu cầu nhập mô tả"),
  categoryIds: yup.array().of(yup.string()).optional(), // Make photoType optional
  photoTags: yup.array().of(yup.string()).optional(), // Make photoTags optional
  location: yup.string().optional(), // Optional if location is not required
  watermark: yup.boolean(),
  visibility: yup.string().required("Yêu cầu chọn chế độ công khai"),
});
