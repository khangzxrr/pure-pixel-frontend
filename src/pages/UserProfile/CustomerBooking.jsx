import React, { useEffect, useState } from "react";
import { CustomerBookingApi } from "../../apis/CustomerBookingApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfigProvider, Pagination, Select, Tooltip } from "antd"; // Make sure Tooltip is imported
import { Calendar, MessageCircleMore } from "lucide-react";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import formatPrice from "../../utils/FormatPriceUtils";
import { useNavigate } from "react-router-dom";
import { FiCameraOff } from "react-icons/fi";
import ChatButton from "../../components/ChatButton/ChatButton";
import { customTheme } from "../../components/Booking/BookingRequestList";
import calculateDateDifference from "../../utils/calculateDateDifference";
import useNotificationStore from "../../states/UseNotificationStore";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useModalState } from "../../hooks/useModalState";
import ReportBookingModal from "../../components/ComReport/ReportBookingModal";

const statuses = [
  { label: "Tất cả", value: "", color: "#FFC107" }, // Yellow
  { label: "Chờ xác nhận", value: "REQUESTED", color: "#FFA500" }, // Orange
  { label: "Đang thực hiện", value: "ACCEPTED", color: "#007BFF" }, // Blue
  { label: "Hoàn thành", value: "SUCCESSED", color: "#28A745" }, // Green
  { label: "Từ chối", value: "DENIED", color: "#DC3545" }, // Red
  { label: "Đã hủy", value: "FAILED", color: "#737373" },
];
const getStatusName = (status) => {
  const statusInfo = statuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : "Chưa xác định";
};
const getTextColor = (status) => {
  const statusInfo = statuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.color : "#6C757D";
};
export default function CustomerBooking() {
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const limit = 8;
  const [page, setPage] = useState(1);
  const [orderByCreatedAt, setOrderByCreatedAt] = useState("desc");
  const [selectedBooking, setSelectedBooking] = useState("");
  const popupReport = useModalState();

  const isSelectedStatus = (value) => {
    return status === value;
  };
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  const { isPending, data } = useQuery({
    queryKey: ["get-all-customer-bookings", limit, page, status],
    queryFn: () =>
      CustomerBookingApi.findAllBooking(
        limit,
        page - 1,
        status,
        orderByCreatedAt
      ),
  });
  const reportBooking = (bookingId) => {
    setSelectedBooking(bookingId);
    popupReport.handleOpen();
  };
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-xl">Danh sách lịch chụp của tôi</span>
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
                  className={`hover:opacity-90 transition-opacity cursor-pointer border-none rounded-lg px-4 py-2 font-semibold `}
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
        "Đang tải"
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data &&
            data.objects.length > 0 &&
            data.objects.map((booking) => (
              <div
                key={booking.id} // Add a unique key for each booking
                className="flex flex-col group h-auto bg-[#36393f] rounded-lg overflow-hidden pb-2"
                onClick={() => {
                  if (
                    booking.status === "ACCEPTED" ||
                    booking.status === "SUCCESSED"
                  ) {
                    navigate(`/profile/customer-booking/${booking.id}`);
                  }
                }}
              >
                <div className="h-[200px] overflow-hidden rounded-t-lg relative">
                  <img
                    src={booking.photoshootPackageHistory.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-1 px-4 py-2 hover:cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold">
                      {booking.photoshootPackageHistory.title}
                    </div>
                    <div
                      className={`text-[12px] font-normal`}
                      style={{ color: ` ${getTextColor(booking.status)}` }}
                    >
                      {getStatusName(booking.status)}
                    </div>
                  </div>

                  <div className="font-normal text-base sm:text-lg underline underline-offset-2">
                    {formatPrice(booking.photoshootPackageHistory.price)}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="size-5 overflow-hidden rounded-full">
                      <img
                        src={booking.originalPhotoshootPackage.user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(
                          `/user/${booking.originalPhotoshootPackage.user.id}`
                        );
                      }}
                      className="text-sm text-blue-500 hover:underline cursor-pointer"
                    >
                      {booking.originalPhotoshootPackage.user.name}
                    </div>

                    <ChatButton
                      userId={booking.originalPhotoshootPackage.user.id}
                    />
                    {booking.status !== "FAILED" && (
                      <Tooltip title="Báo cáo gói chụp">
                        <AiOutlineExclamationCircle
                          className="w-5 h-5 ml-2 hover:opacity-80 z-20"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default behavior (if applicable)
                            e.stopPropagation();
                            reportBooking(booking.id);
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <div>Ghi chú:</div>
                    <p className="list-inside font-normal truncate text-sm max-w-[300px]">
                      {booking.description ? booking.description : "Không có"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <div>Thời gian hẹn:</div>
                    <div className="flex gap-1 font-normal items-center text-sm">
                      <Calendar className="w-4 h-4" />
                      <div>
                        {FormatDateTime(booking.startDate)} -{" "}
                        {FormatDateTime(booking.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-normal text-sm text-[#a3a3a3]">
                    Cập nhật {calculateDateDifference(booking.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {!data ||
        (data.objects.length === 0 && (
          <div className="flex flex-col col-span-3 justify-center items-center text-[#8b8d91] h-[200px]">
            <FiCameraOff className="text-[100px]" />
            Không có gói buổi chụp nào!
          </div>
        ))}
      {popupReport.isModalOpen && (
        <ReportBookingModal
          visible={popupReport.isModalOpen}
          onClose={popupReport.handleClose}
          tile="Báo cáo bài viết"
          id={selectedBooking}
          // reportType =USER, PHOTO, BOOKING, COMMENT;
          reportType={"BOOKING"}
        />
      )}
    </div>
  );
}
