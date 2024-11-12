import React, { useState } from "react";
import { Modal, ConfigProvider, DatePicker, Input } from "antd"; // Importing Ant Design components
import vi_VN from "antd/es/locale/vi_VN"; // Import Vietnamese locale for Ant Design
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "../BookingPage.css"; // Import custom CSS
import PhotoShootApi from "../../../apis/PhotoShootApi";
import { useMutation } from "@tanstack/react-query";
import { photoShootInput } from "../../../yup/PhotoShootInput";
import { CustomerBookingApi } from "../../../apis/CustomerBookingApi";
import { useNotification } from "../../../Notification/Notification";

// Set dayjs to use the Vietnamese locale
dayjs.locale("vi");

const { RangePicker } = DatePicker; // Destructure RangePicker from DatePicker

// Create yup schema for validation

export default function BookingModal({ photoPackage, onClose }) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(photoShootInput),
  }); // Initialize React Hook Form with yup validation
  const { notificationApi } = useNotification();

  const requestBookingByCustomer = useMutation({
    mutateKey: "request-booking-by-customer",
    mutationFn: async ({ packageId, body }) =>
      await CustomerBookingApi.requestBooking(packageId, body),
    onSuccess: () => {
      notificationApi("success", "Thành công", "Đã gửi yêu cầu đặt lịch");
    },
    onError: (error) => {
      let errorMessage = "Đã có lỗi xảy ra";

      // Use a switch statement to handle specific error messages
      switch (error.response?.data?.message) {
        case "CannotBookOwnedPhotoshootPackageException":
          errorMessage =
            "Bạn không thể đặt lịch cho gói chụp ảnh do mình đã đặt.";
          break;
        case "ExistBookingWithSelectedDateException":
          errorMessage = "Đã có lịch hẹn khác vào thời gian bạn chọn.";
          break;
        // Add other cases as needed
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
          expect: data.expect,
          locate: data.locate,
        },
      });

      console.log("Formatted Dates:", formattedDates);
    } else {
      console.log("Date range is not properly selected.");
    }
    onClose(); // Close the modal
  };

  const handleCancel = () => {
    onClose(); // Close the modal when "Cancel" is clicked
  };

  return (
    <ConfigProvider locale={vi_VN}>
      {/* Ant Design Modal */}
      <Modal
        visible={true}
        onOk={handleSubmit(handleOk)}
        onCancel={handleCancel}
      >
        <div>
          <p className="text-lg font-bold">{photoPackage?.title}</p>
          <p className="text-xs text-gray-600 m-1">{photoPackage?.subtitle}</p>
          <p className="text-sm text-gray-400">{photoPackage?.description}</p>

          {/* Ant Design RangePicker with React Hook Form */}
          <form onSubmit={handleSubmit(handleOk)} className="mt-2">
            <p className="text-sm py-3 text-gray-600">Chọn ngày hẹn</p>
            <Controller
              name="dateRange"
              control={control}
              defaultValue={null} // Set an initial value if needed
              render={({ field }) => (
                <>
                  <RangePicker
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
                    className={`w-full font-light ${
                      errors.dateRange ? "border-red-500" : ""
                    }`}
                    onChange={(value) => field.onChange(value)}
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
            <p className="text-sm py-3 text-gray-600 mt-4">
              Bạn có thể chia sẻ thêm về kỳ vọng của bạn cho buổi chụp ảnh
              không?
            </p>

            <Controller
              name="expect"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <Input.TextArea
                    {...field}
                    placeholder="Nhập kỳ vọng của bạn"
                    className={`w-full ${
                      errors.expect ? "border-red-500" : ""
                    }`}
                    rows={4}
                  />
                  {errors.expect && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.expect.message}
                    </p>
                  )}
                </>
              )}
            />

            {/* SearchBox for "locate" */}
            {/* <div className="mt-3">
              <p className="text-sm py-3 text-gray-600">Chọn địa điểm</p>

              <SearchBox
                accessToken={MAPBOX_TOKEN}
                onRetrieve={handleRetrieve}
                options={{
                  language: "vi",
                  country: "vn",
                }}
                placeholder="Tìm kiếm địa điểm..."
                value={selectedLocation || ""} // Show the full address
              />

              {errors.locate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.locate.message}
                </p>
              )}
            </div> */}
          </form>
        </div>
      </Modal>
    </ConfigProvider>
  );
}
