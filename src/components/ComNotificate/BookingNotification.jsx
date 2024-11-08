import { useQuery } from "@tanstack/react-query";
import React from "react";
import PhotoShootApi from "../../apis/PhotoShootApi";

export default function BookingNotification({ notification }) {
  const {
    data: bookingDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [`booking-by-${notification.referenceId}`],
    queryFn: () => PhotoShootApi.getBookingDetail(notification.referenceId),
  });
  console.log(bookingDetail, isLoading, isError, "bookingDetail");

  return (
    <div className="flex items-center gap-2 p-2 rounded-sm hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200">
      <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
        <img
          src={bookingDetail?.originalPhotoshootPackage?.thumbnail}
          alt="gói chụp"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-[225px] lg:w-[335px] text-sm lg:text-base">
        {/* <span className="font-bold">{notification.name}</span> đã bắt
  đầu theo dõi bạn */}
        {bookingDetail?.status ? notification.title : "Yêu cầu đang được xử lý"}
      </div>
    </div>
  );
}
