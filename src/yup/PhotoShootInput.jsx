import * as yup from "yup";
import dayjs from "dayjs";
import "dayjs/locale/vi";

export const photoShootInput = yup.object().shape({
  dateRange: yup
    .array()
    .of(yup.date().required("Ngày là bắt buộc")) // Each date is required
    .required("Khoảng thời gian là bắt buộc") // Ensure dateRange itself is not null or undefined
    .min(2, "Bạn cần chọn cả ngày bắt đầu và ngày kết thúc") // Ensure there are exactly two dates
    .test(
      "start-date-check",
      "Ngày bắt đầu phải sau ngày hiện tại ít nhất 24 giờ",

      (value) => {
        const currentDate = dayjs();
        const startDate = value && value[0];
        return (
          startDate && dayjs(startDate).isAfter(currentDate.add(1440, "minute"))
        );
      }
    )
    .test(
      "end-date-check",
      "Ngày kết thúc phải sau ngày bắt đầu ít nhất 3 giờ",
      (value) => {
        const startDate = value && value[0];
        const endDate = value && value[1];
        return (
          startDate &&
          endDate &&
          dayjs(endDate).isAfter(dayjs(startDate).add(179, "minute"))
        );
      }
    ),
  expect: yup.string(), // Validation for "expect"
  locate: yup.string(), // Validation for "locate"
});
