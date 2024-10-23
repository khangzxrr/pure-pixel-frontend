import * as yup from "yup";
import { ExifField } from "../components/Photographer/UploadPhoto/PhotoDataFields";

// Define validation schema
export const uploadPhotoInputSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  photoType: yup.string().required("Photo type is required"),
  photoTags: yup.array().of(yup.string()).optional(),
  location: yup.string().optional(),
  watermark: yup.boolean().optional(),
  watermarkContent: yup.string().when("watermark", {
    is: true,
    then: yup.string().required("Watermark content is required"),
    otherwise: yup.string().optional(),
  }),
  showExif: yup.boolean().optional(),
  visibility: yup.string().required("Visibility is required"),
  ...ExifField.reduce((acc, field) => {
    acc[field.name] = yup.string().optional();
    return acc;
  }, {}),
});
