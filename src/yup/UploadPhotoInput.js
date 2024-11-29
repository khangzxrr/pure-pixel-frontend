import * as yup from "yup";

export const uploadPhotoInputSchema = yup.object().shape({
  title: yup.string().required("Yêu cầu nhập tiêu đề"),
  description: yup.string().max(1000, "Mô tả của bạn quá dài"),
  categoryIds: yup.array().of(yup.string()).optional(), // Make photoType optional
  photoTags: yup.array().of(yup.string()).optional(), // Make photoTags optional
  location: yup.string().optional(), // Optional if location is not required
  watermark: yup.boolean(),
  watermarkContent: yup.string().when("watermark", {
    is: true,
    then: (schema) =>
      schema.required("Nội dung nhãn không được để trống khi gắn nhãn"),
    otherwise: (schema) => schema.optional(),
  }),
  showExif: yup.boolean(),
  visibility: yup.string().required("Yêu cầu chọn chế độ công khai"),
});
