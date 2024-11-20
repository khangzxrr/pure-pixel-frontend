import { Calendar, MessageCircleMore } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import formatPrice from "../../../utils/FormatPriceUtils";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import { FormatDateTime } from "../../../utils/FormatDateTimeUtils";
import { Popconfirm, Tooltip } from "antd";
import { useNotification } from "../../../Notification/Notification";
import ChatButton from "../../ChatButton/ChatButton";
import calculateDateDifference from "../../../utils/calculateDateDifference";
const statuses = [
  { label: "Tất cả", value: "", color: "#FFC107" }, // Yellow
  { label: "Chờ xác nhận", value: "REQUESTED", color: "#FFA500" }, // Orange
  { label: "Đang thực hiện", value: "ACCEPTED", color: "#007BFF" }, // Blue
  { label: "Hoàn thành", value: "SUCCESSED", color: "#28A745" }, // Green
  { label: "Đã hủy", value: "DENIED", color: "#DC3545" }, // Red
  { label: "Thất bại", value: "FAILED", color: "#6C757D" }, // Gray
];

const getTextColor = (status) => {
  const statusInfo = statuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.color : "#6C757D";
};
const getStatusName = (status) => {
  const statusInfo = statuses.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : "Chưa xác định";
};
const BookingCard = ({ booking, status }) => {
  const queryClient = useQueryClient();
  const { notificationApi } = useNotification();
  const navigate = useNavigate();

  const acceptBookingMutation = useMutation({
    mutationKey: "acceptBooking",
    mutationFn: () => PhotographerBookingApi.acceptBooking(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries("get-all-photographer-booking");
      queryClient.invalidateQueries("booking-photographer-detail");
      notificationApi("success", "Thành công", "Đã chấp nhận lịch hẹn này");
      navigate(`/profile/booking/${booking.id}`);
    },
  });

  const handleAcceptButtonOnClick = () => {
    acceptBookingMutation.mutate();
  };
  const denyBookingMutation = useMutation({
    mutationKey: "denyBooking",
    mutationFn: () => PhotographerBookingApi.denyBooking(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries("get-all-photographer-booking");
    },
  });

  const handleDenyBooking = () => {
    denyBookingMutation.mutate();
  };
  const handleBookingOnClick = () => {
    if (booking.status === "ACCEPTED" || booking.status === "SUCCESSED") {
      navigate(`/profile/booking/${booking.id}`);
    }
  };

  return (
    <>
      <div
        onClick={() => handleBookingOnClick()}
        className="flex flex-col group h-auto  bg-[#36393f] rounded-lg overflow-hidden pb-2"
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
              style={{ color: ` ${getTextColor(status)}` }}
            >
              {/* {booking.photoshootPackageHistory.subtitle} */}
              {getStatusName(status)}
            </div>
          </div>

          <div className="font-normal text-base sm:text-lg underline underline-offset-2">
            {formatPrice(booking.photoshootPackageHistory.price)}
          </div>

          <div className="flex item-center gap-2 mt-2">
            <div className="size-5 overflow-hidden rounded-full ">
              <img
                src={booking.user.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm ">{booking.user.name}</div>

            <ChatButton userId={booking.user.id} />
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
            {calculateDateDifference(booking.createdAt)}
          </div>
        </div>

        {booking.status === "REQUESTED" &&
          (acceptBookingMutation.isPending ? (
            <div>Đang chấp nhận lịch hẹn này...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-2 px-5">
              <div className="col-span-1">
                <Popconfirm
                  title="Xác nhận từ chối"
                  description="Bạn có chắc muốn từ chối lịch hẹn này không?"
                  onConfirm={handleDenyBooking}
                  onCancel={() => console.log("Cancelled")}
                  okText="Từ chối"
                  cancelText="Hủy"
                >
                  <button className="transition duration-300 text-red-500 border border-red-500 w-full px-2 py-1 rounded-lg hover:text-[#eee] hover:bg-red-500">
                    Từ chối
                  </button>{" "}
                </Popconfirm>
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => handleAcceptButtonOnClick()}
                  // onClick={() => navigate(`/profile/booking/${123}`)}
                  className="transition duration-300 bg-[#eee] text-[#202225] w-full px-2 py-1 rounded-lg hover:bg-[#c0c0c0]"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default BookingCard;
