import * as yup from "yup";

// Define validation schema
export const uploadPhotoInputSchema = yup.object().shape({
  imageDetails: yup.string().required("Image details are required"),
  additionalDetails: yup.string().required("Additional details are required"),
  type: yup.string().required("Type selection is required"),
  tag: yup.array().min(1, "At least one tag is required"),
  location: yup.string().required("Location is required"),
});
