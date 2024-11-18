import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { PhotographerBookingApi } from "../../apis/PhotographerBookingApi";
import BookingCard from "./BookingRequestState/BookingCard";
import { ConfigProvider, Pagination } from "antd";
import { FiCameraOff } from "react-icons/fi";

const statuses = [
  { label: "Tất cả", value: "", color: "#FFC107" }, // Yellow
  { label: "Chờ xác nhận", value: "REQUESTED", color: "#FFA500" }, // Orange
  { label: "Đang thực hiện", value: "ACCEPTED", color: "#007BFF" }, // Blue
  { label: "Hoàn thành", value: "SUCCESSED", color: "#28A745" }, // Green
  { label: "Đã hủy", value: "DENIED", color: "#DC3545" }, // Red
  { label: "Thất bại", value: "FAILED", color: "#6C757D" }, // Gray
];

const BookingRequestList = () => {
  const limit = 8;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const isSelectedStatus = (value) => {
    console.log("value", value, status);
    return status === value;
  };
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  const { isPending, data } = useQuery({
    queryKey: ["get-all-photographer-booking", status, page],
    queryFn: () =>
      PhotographerBookingApi.findAllBooking(limit, page - 1, status),
  });
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-xl">Danh sách lịch hẹn chụp cho khách</span>

        <div className="flex justify-between items-center border-b-2 text-sm font-medium border-[#818181] pb-2 mb-2">
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
                className={`hover:opacity-90 transition-opacity cursor-pointer border-none rounded-lg px-4 py-2 font-semibold`}
              >
                {statusField.label}
              </button>
            ))}
          </div>
          {data && data.totalPage > 1 && (
            <ConfigProvider
              theme={{
                token: {
                  colorBgContainer: "#1e1e1e",
                  colorText: "#b3b3b3",
                  colorPrimary: "white",
                  colorBgTextHover: "#333333",
                  colorBgTextActive: "#333333",
                  colorTextDisabled: "#666666",
                },
              }}
            >
              <Pagination
                current={page}
                total={data.totalPage * limit}
                onChange={handlePageClick}
                pageSize={8}
                showSizeChanger={false}
                className="my-2"
              />
            </ConfigProvider>
          )}
        </div>
      </div>
      {isPending ? (
        "Đang tải"
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data &&
            data.objects.length > 0 &&
            data.objects.map((booking) => {
              return (
                <BookingCard
                  booking={booking}
                  textStateColor={"text-yellow-500"}
                  status={booking.status}
                />
              );
            })}
        </div>
      )}
      {!data ||
        (data.objects.length === 0 && (
          <div className="flex flex-col col-span-3 justify-center items-center text-[#8b8d91] h-[200px]">
            <FiCameraOff className="text-[100px]" />
            Không có gói buổi chụp nào!
          </div>
        ))}
    </div>
  );
};

export default BookingRequestList;
