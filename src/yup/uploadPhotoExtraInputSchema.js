import * as yup from "yup";

// Define validation schema
export const uploadPhotoExtraOptionInputSchema = yup.object().shape({
  camera: yup.string().required("Camera is required"),
  lens: yup.string().required("Lens is required"),
  focalLength: yup.string().required("Focal length is required"),
  shutterSpeed: yup.string().required("Shutter speed is required"),
  aperture: yup.string().required("Aperture is required"),
  iso: yup.string().required("ISO is required"),
  shootDate: yup.string().required("Shoot date is required"),
});
