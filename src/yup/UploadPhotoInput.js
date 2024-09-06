import * as yup from "yup";

// Define validation schema
export const uploadPhotoInputSchema = yup.object().shape({
  imageDetails: yup.string().required("Image details are required"),
  additionalDetails: yup.string(),
  type: yup.string(),
  tag: yup.array(),
  location: yup.string(),
});
