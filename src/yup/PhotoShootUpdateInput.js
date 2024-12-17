import * as yup from "yup";
import "dayjs/locale/vi";

export const PhotoShootUpdateInput = yup.object().shape({
  description: yup.string().max(1000, "Mô tả của gói quá dài "), // Limits description to 1000 characters
});
