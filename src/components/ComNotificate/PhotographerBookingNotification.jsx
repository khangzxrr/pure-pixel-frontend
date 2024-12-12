import React from "react";
import calculateDateDifference from "../../utils/calculateDateDifference";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CustomerBookingApi } from "../../apis/CustomerBookingApi";
import { PhotographerBookingApi } from "../../apis/PhotographerBookingApi";

// REFERENCE TYPE:
// "PHOTOGRAPHER_BOOKING_NEW_REQUEST"
// "PHOTOGRAPHER_NEW_BOOKING_REVIEW"
export default function PhotographerBookingNotification({
  notification,
  onClose,
}) {
  const navigate = useNavigate();
  const bookingId = notification.payload.id;
  const { data: bookingDetail } = useQuery({
    queryKey: ["photographer-booking-noti", bookingId],
    queryFn: () => PhotographerBookingApi.findById(bookingId),
  });
  const handleNavigate = (referenceType) => {
    switch (referenceType) {
      case "PHOTOGRAPHER_BOOKING_NEW_REQUEST":
        navigate("/profile/booking-request");
        break;

      case "PHOTOGRAPHER_NEW_BOOKING_REVIEW":
        navigate(`/profile/booking-request/${notification.payload.id}`);
        break;

      default:
        break;
    }
  };
  return (
    <div
      className="border-b border-gray-500 px-1 py-2  hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200"
      key={notification.id}
      onClick={() => {
        console.log(notification.referenceType);
        handleNavigate(notification.referenceType);
        onClose();
      }}
    >
      <div className="flex items-center gap-2 p-2 rounded-sm">
        <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
          <img
            src={
              bookingDetail?.photoshootPackageHistory?.thumbnail ||
              "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            }
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-[225px] lg:w-[335px] text-sm lg:text-base">
          {notification.content}
        </div>
      </div>
      <div className="text-right text-sm text-gray-400">
        {calculateDateDifference(notification.updatedAt)}
      </div>
    </div>
  );
}
