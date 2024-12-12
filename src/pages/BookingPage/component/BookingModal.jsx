import React, { useState } from "react";
import { Modal, ConfigProvider, DatePicker, Input } from "antd";
import vi_VN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "../BookingPage.css";
import PhotoShootApi from "../../../apis/PhotoShootApi";
import { useMutation } from "@tanstack/react-query";
import { photoShootInput } from "../../../yup/PhotoShootInput";
import { CustomerBookingApi } from "../../../apis/CustomerBookingApi";
import { useNotification } from "../../../Notification/Notification";
import { useNavigate } from "react-router-dom";
import { set } from "lodash";

// Set dayjs to use the Vietnamese locale
dayjs.locale("vi");

const { RangePicker } = DatePicker;

export default function BookingModal({ photoPackage, onClose }) {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(photoShootInput),
  });

  const { notificationApi } = useNotification();

  const requestBookingByCustomer = useMutation({
    mutateKey: "request-booking-by-customer",
    mutationFn: async ({ packageId, body }) =>
      await CustomerBookingApi.requestBooking(packageId, body),
    onSuccess: () => {
      notificationApi(
        "success",
        "Đã gửi yêu cầu đặt lịch",
        "Vui lòng kiểm tra trạng thái trong mục lịch hẹn của bạn."
      );
      navigate("/profile/customer-booking");
      onClose();
    },
    onError: (error) => {
      let errorMessage = "Đã có lỗi xảy ra";

      switch (error.response?.data?.message) {
        case "CannotBookOwnedPhotoshootPackageException":
          errorMessage = "Bạn không thể đặt lịch gói chụp ảnh của chính mình.";
          break;
        case "ExistBookingWithSelectedDateException":
          errorMessage = "Bạn đã có gói chụp cho khoảng thời gian này.";
          break;
        case "PhotoshootPackageDisabledException":
          errorMessage = (
            <span
              onClick={(e) => {
                e.preventDefault(); // Prevent default behavior (if applicable)
                e.stopPropagation(); // Prevent event from propagating to parent elements
                navigate("/explore/booking-package");
              }}
              className="cursor-pointer hover:opacity-85"
            >
              Gói chụp này đã bị vô hiệu hóa (nhấn vào đây để xem các gói chụp
              khác)
            </span>
          );
          break;
        default:
          errorMessage = error.response?.data?.message || errorMessage;
          break;
      }

      notificationApi("error", "Lỗi", errorMessage);
    },
  });

  const handleOk = (data) => {
    if (data.dateRange && data.dateRange.length === 2) {
      console.log("Data:", data);

      const formattedDates = {
        startDate: dayjs(data.dateRange[0]).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        endDate: dayjs(data.dateRange[1]).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      };

      requestBookingByCustomer.mutate({
        packageId: photoPackage.id,
        body: {
          startDate: formattedDates.startDate,
          endDate: formattedDates.endDate,
          description: data.description,
        },
      });

      console.log("Formatted Dates:", formattedDates);
    } else {
      console.log("Date range is not properly selected.");
    }
  };

  const handleCancel = () => {
    onClose();
  };
  const current = dayjs().add(1, "day");
  const minStartDate = dayjs().add(1, "day").startOf("day"); // 1440 minutes (24 hours) from now
  const maxStartDate = dayjs().add(3, "month").endOf("day"); // End of the day 3 months from now
  const disabledDate = (current) => {
    return current && (current < minStartDate || current > maxStartDate);
  };
  const [startDateTime, setStartDateTime] = useState(null);
  console.log("startDateTime", startDateTime, current.hour());
  const disabledTime = (date) => {
    if (date.isSame(current, "day") && current.hour()) {
      // console.log("current.hour()", current.hour());
      return {
        disabledHours: () =>
          Array.from({ length: 24 }, (_, i) => i).filter(
            (hour) => hour < current.hour()
          ),
      };
    }
    if (date.isSame(current, "hour") && current.minute()) {
      // console.log("current.minute()", current.minute());
      return {
        disabledMinutes: () =>
          Array.from({ length: 60 }, (_, i) => i).filter(
            (minute) => minute < current.minute()
          ),
      };
    }

    // if (date.isSame(startDateTime, "day")) {
    //   return {
    //     disabledHours: () =>
    //       Array.from({ length: 24 }, (_, i) => i).filter((hour) => hour > 17),
    //   };
    // }

    // Only need to consider the start and end time
    // the range itself has been disabled by `disabledDate`
    return {};
  };
  const canlendarChange = (date, dateString) => {
    if (date && date[0]) setStartDateTime(date[0]);

    console.log(date, dateString);
  };
  return (
    <ConfigProvider
      locale={vi_VN}
      theme={{
        components: {
          Modal: {
            contentBg: "#2f3136",
            headerBg: "#2f3136",
            titleColor: "white",
          },
          DatePicker: {
            activeBorderColor: "#e0e0e0",
          },
        },
      }}
    >
      <Modal
        visible={true}
        onOk={handleSubmit(handleOk)}
        onCancel={handleCancel}
        className="custom-close-icon"
      >
        <div>
          <p className="text-lg font-bold text-[#d7d7d8]">
            {photoPackage?.title}
          </p>
          <p className="text-xs text-[#d7d7d8] m-1">{photoPackage?.subtitle}</p>
          <p className="text-sm text-[#d7d7d8]">{photoPackage?.description}</p>

          {/* Ant Design RangePicker with React Hook Form */}
          <form onSubmit={handleSubmit(handleOk)} className="mt-2">
            <p className="text-sm py-3 text-[#d7d7d8]">Chọn ngày hẹn</p>
            <Controller
              name="dateRange"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <>
                  <RangePicker
                    style={{ backgroundColor: "#292b2f", outline: "none" }}
                    {...field}
                    format="HH:mm DD-MM-YYYY"
                    showTime={{
                      format: "HH-mm",
                      defaultValue: [dayjs().hour(0), dayjs().hour(23)],
                    }}
                    placeholder={[
                      "Chọn giờ & ngày bắt đầu",
                      "Chọn giờ & ngày kết thúc",
                    ]}
                    className={`custom-range-picker w-full font-light ${
                      errors.dateRange ? "border-red-500" : ""
                    }`}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabledDate={disabledDate}
                    disabledTime={disabledTime}
                    onCalendarChange={canlendarChange}
                  />
                  {errors.dateRange && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateRange.message}
                    </p>
                  )}
                </>
              )}
            />

            {/* TextArea for "expect" */}
            <p className="text-sm py-3 text-[#d7d7d8] mt-4">
              Bạn có thể chia sẻ thêm về kỳ vọng của bạn cho buổi chụp ảnh
              không?
            </p>

            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <textarea
                    {...field}
                    placeholder="Nhập kỳ vọng của bạn"
                    className={`w-full text-[#d7d7d8] bg-transparent hover:bg-transparent focus:bg-transparent mb-4 p-2  lg:text-base text-xs focus:ring-0 focus:outline-none border-[1px] rounded-lg  placeholder:text-[#d7d7d8]  ${
                      errors.description
                        ? "border-red-500 focus:border-red-600 hover:border-red-600"
                        : "border-[#4c4e52] focus:border-[#e0e0e0] hover:border-[#e0e0e0]"
                    }`}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </>
              )}
            />
          </form>
        </div>
      </Modal>
    </ConfigProvider>
  );
}
