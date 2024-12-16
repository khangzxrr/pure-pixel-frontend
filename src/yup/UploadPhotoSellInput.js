import * as yup from "yup";

export const uploadPhotoSellInput = yup.object().shape({
  title: yup.string().required("Yêu cầu nhập tiêu đề"),
  description: yup
    .string()
    .max(1000, "Mô tả của bạn quá dài")
    .test(
      "no-phonenumber",
      "Mô tả không được chứa số điện thoại",
      (value) => !value || !/(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(value) // Regex for phone numbers
    ),
  categoryIds: yup.array().of(yup.string()).optional(),
  photoTags: yup.array().of(yup.string()).optional(),
  location: yup.string().optional(),
  pricetags: yup
    .array()
    .of(
      yup.object().shape({
        price: yup
          .number()
          .optional()
          .transform((value, originalValue) => {
            if (typeof originalValue === "string") {
              // Convert the value to a number
              const parsedValue = parseInt(
                originalValue.replace(/\./g, ""),
                10
              );
              return isNaN(parsedValue) ? undefined : parsedValue;
            }
            return value;
          })
          .test(
            "price-min-value",
            "Giá phải từ 1,000vnđ trở lên",
            (value) => value === undefined || value > 999 || value === 0
          )
          .test(
            "price-max-value",
            "Giá không được vượt quá 100 triệu đồng",
            (value) => value === undefined || value <= 100000000
          ),
      })
    )
    .test(
      "at-least-one-complete",
      "Yêu cầu có giá tiền cho ít nhất một kích cỡ ảnh bán",
      (pricetags) =>
        Array.isArray(pricetags) &&
        pricetags.some((tag) => typeof tag.price === "number" && tag.price > 0)
    ),
});
