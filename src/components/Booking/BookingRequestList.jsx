import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { PhotographerBookingApi } from "../../apis/PhotographerBookingApi";
import BookingCard from "./BookingRequestState/BookingCard";
import { ConfigProvider, Pagination, Select } from "antd";
import { FiCameraOff } from "react-icons/fi";
import useNotificationStore from "../../states/UseNotificationStore";

const statuses = [
  { label: "Tất cả", value: "", color: "#FFC107" }, // Yellow
  { label: "Chờ xác nhận", value: "REQUESTED", color: "#FFA500" }, // Orange
  { label: "Đang thực hiện", value: "ACCEPTED", color: "#007BFF" }, // Blue
  { label: "Hoàn thành", value: "SUCCESSED", color: "#28A745" }, // Green
  { label: "Đã hủy", value: "DENIED", color: "#DC3545" }, // Red
];
// Theme Configuration
export const customTheme = {
  token: {
    colorBgContainer: "#1e1e1e",
    colorText: "#b3b3b3",
    colorPrimary: "white",
    colorBgTextHover: "#333333",
    colorBgTextActive: "#333333",
    colorTextDisabled: "#666666",
  },
  components: {
    Select: {
      colorBgContainer: "#292b2f",
      colorBorder: "#4c4e52",
      activeBorderColor: "#e0e0e0",
      colorPrimaryHover: "#e0e0e0",
      colorPrimary: "#292b2f",
      controlItemBgActive: "#e3e3e3",
      colorText: "#e0e0e0",
      colorTextPlaceholder: "#e0e0e0",
      controlItemBgHover: "rgba(0, 0, 0, 0.04)",
      fontSize: 14,
      optionSelectedFontWeight: 400,
      optionSelectedColor: "black",
    },
  },
};

const BookingRequestList = () => {
  const limit = 8;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [orderByCreatedAt, setOrderByCreatedAt] = useState("desc");
  const isSelectedStatus = (value) => status === value;

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };

  const { isPending, data } = useQuery({
    queryKey: ["get-all-photographer-booking", status, page, orderByCreatedAt],
    queryFn: () =>
      PhotographerBookingApi.findAllBooking(
        limit,
        page - 1,
        status,
        orderByCreatedAt
      ),
  });
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-xl">Danh sách lịch hẹn chụp cho khách</span>

        <div className="flex justify-between items-center border-b-2 text-sm font-medium border-[#818181] pb-2 mb-2">
          <ConfigProvider theme={customTheme}>
            <div className="flex gap-3">
              {statuses.map((statusField) => (
                <button
                  key={statusField.value}
                  onClick={() => {
                    setStatus(statusField.value);
                    setPage(1);
                  }}
                  style={{
                    backgroundColor: isSelectedStatus(statusField.value)
                      ? "#fff"
                      : statusField.color,
                    color: isSelectedStatus(statusField.value)
                      ? statusField.color
                      : "#fff",
                  }}
                  className="hover:opacity-90 transition-opacity cursor-pointer border-none rounded-lg px-4 py-2 font-semibold"
                >
                  {statusField.label}
                </button>
              ))}
            </div>
            <div className="flex flex-row">
              <Select
                value={orderByCreatedAt}
                options={[
                  { label: "Mới nhất", value: "desc" },
                  { label: "Cũ nhất", value: "asc" },
                ]}
                className="photo-privacy-select m-2"
                onChange={(value) => {
                  setOrderByCreatedAt(value);
                }}
              />
              {data && data.totalPage > 1 && (
                <Pagination
                  current={page}
                  total={data.totalPage * limit}
                  onChange={handlePageClick}
                  pageSize={8}
                  showSizeChanger={false}
                  className="my-2"
                />
              )}
            </div>
          </ConfigProvider>
        </div>
      </div>

      {isPending ? (
        <div>Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data?.objects.length > 0 ? (
            data.objects.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                textStateColor={"text-yellow-500"}
                status={booking.status}
              />
            ))
          ) : (
            <div className="flex flex-col col-span-3 justify-center items-center text-[#8b8d91] h-[200px]">
              <FiCameraOff className="text-[100px]" />
              Không có gói buổi chụp nào!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingRequestList;
