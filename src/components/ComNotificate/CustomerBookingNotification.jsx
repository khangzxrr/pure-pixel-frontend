import React from "react";
import calculateDateDifference from "../../utils/calculateDateDifference";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CustomerBookingApi } from "../../apis/CustomerBookingApi";

// REFERENCE TYPE:
// "CUSTOMER_BOOKING_REQUEST"
// "CUSTOMER_BOOKING_CANCEL"
// "CUSTOMER_BOOKING_ACCEPT"
// "CUSTOMER_BOOKING_PHOTO_ADD"
// "CUSTOMER_BOOKING_PHOTO_REMOVE"
// "CUSTOMER_BOOKING_PAID"
// "CUSTOMER_BOOKING_BILL_UPDATE"
export default function CustomerBookingNotification({ notification, onClose }) {
  const navigate = useNavigate();
  const bookingId = notification.payload.id;
  const { data: bookingDetail, isPending } = useQuery({
    queryKey: ["customer-booking-noti", bookingId],
    queryFn: () => CustomerBookingApi.findById(bookingId),
  });
  const handleNavigate = (referenceType) => {
    switch (referenceType) {
      case "CUSTOMER_BOOKING_REQUEST":
      case "CUSTOMER_BOOKING_CANCEL":
      case "CUSTOMER_BOOKING_ACCEPT":
        navigate("/profile/customer-booking");
        break;

      case "CUSTOMER_BOOKING_PHOTO_ADD":
      case "CUSTOMER_BOOKING_PHOTO_REMOVE":
      case "CUSTOMER_BOOKING_BILL_UPDATE":
      case "CUSTOMER_BOOKING_PAID":
        navigate(`/profile/customer-booking/${notification.payload.id}`);
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
