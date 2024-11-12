import * as yup from "yup";
import dayjs from "dayjs";
import "dayjs/locale/vi";

export const photoShootInput = yup.object().shape({
  dateRange: yup
    .array()
    .nullable()
    .required("Vui lòng chọn khoảng thời gian")
    .test(
      "start-date-check",
      "Ngày bắt đầu phải sau ngày hiện tại ít nhất 1 ngày",
      (value) => {
        const currentDate = dayjs();
        const startDate = value && value[0];
        return (
          startDate &&
          dayjs(startDate).isAfter(currentDate.add(1, "day"), "day")
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
          dayjs(endDate).isAfter(dayjs(startDate).add(3, "hour"))
        );
      }
    ),
  expect: yup.string(), // Validation for "expect"
  locate: yup.string(), // Validation for "locate"
});
