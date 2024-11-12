import { Calendar, MessageCircleMore } from "lucide-react";
import React, { useState } from "react";
import BookingRejectWarningModel from "./BookingRejectWarningModel";
import { useNavigate } from "react-router-dom";
import formatPrice from "../../../utils/FormatPriceUtils";
import { useMutation } from "@tanstack/react-query";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import { FormatDateTime } from "../../../utils/FormatDateTimeUtils";
import { Tooltip } from "antd";
import { useNotification } from "../../../Notification/Notification";


const BookingRequestCard = ({ booking }) => {
  const { notificationApi } = useNotification();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  const acceptBookingMutation = useMutation({
    mutationFn: () => PhotographerBookingApi.acceptBooking(booking.id),
  });

  const handleAcceptButtonOnClick = () => {
    acceptBookingMutation.mutate();

    notificationApi("success", "Thành công", "Đã chấp nhận lịch hẹn này");

    navigate(`/profile/booking/${booking.id}`);
  };

  const handleBookingOnClick = () => {
    if (booking.status === "ACCEPTED") {
      navigate(`/profile/booking/${booking.id}`);
    }
  };

  return (
    <>
      {isModalVisible && (
        <BookingRejectWarningModel
          booking={booking}
          onClose={handleHideModal}
        />
      )}
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
            <div className={`text-[12px] font-normal`}>
              {booking.photoshootPackageHistory.subtitle}
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
            <Tooltip title="Nhắn tin" color="blue">
              <MessageCircleMore
                className="w-5 h-5 ml-2 hover:text-blue-500 z-20"
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/message?to=${booking.user.id}`);
                }}
              />
            </Tooltip>
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
        </div>

        {booking.status === "REQUESTED" &&
          (acceptBookingMutation.isPending ? (
            <div>Đang chấp nhận lịch hẹn này...</div>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2 px-5">
              <button
                onClick={handleShowModal}
                className="transition duration-300 text-red-500 border border-red-500 w-full px-2 py-1 rounded-lg hover:text-[#eee] hover:bg-red-500"
              >
                Từ chối
              </button>

              <button
                onClick={() => handleAcceptButtonOnClick()}
                // onClick={() => navigate(`/profile/booking/${123}`)}
                className="transition duration-300 bg-[#eee] text-[#202225] w-full px-2 py-1 rounded-lg hover:bg-[#c0c0c0]"
              >
                Xác nhận
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

export default BookingRequestCard;
