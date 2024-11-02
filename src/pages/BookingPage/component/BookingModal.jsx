import React, { useState } from "react";
import { Modal, ConfigProvider, DatePicker, Button, Input } from "antd"; // Importing Ant Design components
import vi_VN from "antd/es/locale/vi_VN"; // Import Vietnamese locale for Ant Design
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "../BookingPage.css"; // Import custom CSS
import PhotoShootApi from "../../../apis/PhotoShootApi";
import { useMutation } from "@tanstack/react-query";
import { SearchBox } from "@mapbox/search-js-react"; // Import SearchBox from Mapbox

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your Mapbox token here

// Set dayjs to use the Vietnamese locale
dayjs.locale("vi");

const { RangePicker } = DatePicker; // Destructure RangePicker from DatePicker

// Create yup schema for validation
const validationSchema = yup.object().shape({
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

export default function BookingModal({ photoPackage }) {
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [selectedLocation, setSelectedLocation] = useState(""); // State for selected location text

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  }); // Initialize React Hook Form with yup validation

  const requestBookingByCustomer = useMutation({
    mutateKey: "request-booking-by-customer",
    mutationFn: async ({ packageId, body }) =>
      await PhotoShootApi.requestBookingByCustomer(packageId, body),
  });

  const showModal = () => {
    setIsModalVisible(true); // Show the modal when the button is clicked
  };

  const handleOk = (data) => {
    if (data.dateRange && data.dateRange.length === 2) {
      const formattedDates = {
        startDate: data.dateRange[0].format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        endDate: data.dateRange[1].format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
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
    setIsModalVisible(false); // Close the modal
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal when "Cancel" is clicked
  };

  // Handle the selection of a location from the SearchBox
  const handleRetrieve = (res) => {
    if (res && res.features && res.features.length > 0) {
      const place_name = res.features[0].properties.name;

      let full_address = res.features[0].properties.full_address
        .split(", ")
        .slice(0, -2)
        .join(", ");
      // if (full_address) {
      //   // Split the full_address by commas
      //   const addressParts = full_address.split(", ");

      //   // Remove the last two elements if there are more than two parts
      //   if (addressParts.length > 2) {
      //     full_address = addressParts.slice(0, -2).join(", ");
      //   } else {
      //     // If there are only one or two parts, just use the first part
      //     full_address = addressParts[0];
      //   }
      // }
      console.log("Selected location:", full_address);

      setSelectedLocation(place_name, "-", full_address);
      console.log("Selected location:", place_name, "-", full_address);

      setValue("locate", place_name, "-", full_address); // Update the form value for the "locate" field
    }
  };

  return (
    <ConfigProvider locale={vi_VN}>
      <div>
        <button
          onClick={showModal}
          className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Đặt lịch
        </button>
        {/* Ant Design Modal */}
        <Modal
          visible={isModalVisible}
          onOk={handleSubmit(handleOk)} // Use handleSubmit from React Hook Form
          onCancel={handleCancel}
        >
          <div>
            <p className="text-lg font-bold">{photoPackage?.title}</p>
            <p className="text-xs text-gray-600 m-1">
              {photoPackage?.subtitle}
            </p>
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
                      className={`w-full ${
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
              <div className="mt-3">
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
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
