
import React, { useState } from "react";
import { CustomerBookingApi } from "../../apis/CustomerBookingApi";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "antd"; // Make sure Tooltip is imported
import { Calendar, MessageCircleMore } from "lucide-react";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import formatPrice from "../../utils/FormatPriceUtils";
import { useNavigate } from "react-router-dom";

export default function CustomerBooking() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { isPending, data } = useQuery({
    queryKey: ["get-all-customer-bookings", limit, page, status],
    queryFn: () => CustomerBookingApi.findAllBooking(limit, page, status),
    keepPreviousData: true,
  });
  console.log(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {data &&
        data.objects.map((booking) => (
          <div
            key={booking.id} // Add a unique key for each booking
            className="flex flex-col group h-auto bg-[#36393f] rounded-lg overflow-hidden pb-2"
            onClick={() => navigate(`/profile/customer-booking/${booking.id}`)}
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
                  className={`text-[12px] font-normal ${
                    booking.status === "ACCEPTED"
                      ? "text-blue-500"
                      : booking.status === "SUCCESSED"
                      ? "text-green-500"
                      : "text-yellow-500"
                  } font-normal text-sm`}
                >
                  {booking.status === "ACCEPTED"
                    ? "Đang thực hiện"
                    : booking.status === "SUCCESSED"
                    ? "Đã hoàn thành"
                    : "Chờ xác nhận"}{" "}
                </div>
              </div>

              <div className="font-normal text-base sm:text-lg underline underline-offset-2">
                {formatPrice(booking.photoshootPackageHistory.price)}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="size-5 overflow-hidden rounded-full">
                  <img
                    src={booking.user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm">{booking.user.name}</div>
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
          </div>
        ))}
    </div>
  );
}
