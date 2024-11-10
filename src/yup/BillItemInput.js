// billItemValidation.js
import * as yup from "yup";

const billItemSchema = yup.object({
  type: yup
    .string()
    .required("Type is required")
    .oneOf(["INCREASE", "DECREASE"], "Invalid type"),
  title: yup.string().required("Title is required").trim(),
  price: yup
    .string()
    .required("Price is required")
    .matches(/^\d+(\.\d{3})*$/, "Price must be a valid number format"), // Regex to allow formatted numbers like 1.000, 10.000
});

export default billItemSchema;
