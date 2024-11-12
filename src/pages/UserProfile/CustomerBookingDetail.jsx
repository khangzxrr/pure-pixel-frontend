import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { CustomerBookingApi } from "../../apis/CustomerBookingApi";
import { Tooltip } from "antd";
import formatPrice from "../../utils/FormatPriceUtils";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { ArrowRight, Calendar, MessageCircleMore } from "lucide-react";

const CustomerBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const queryClient = useQueryClient();

  const { isPending, data: bookingDetail } = useQuery({
    queryKey: ["customer-booking-detail", bookingId],
    queryFn: () => CustomerBookingApi.findById(bookingId),
  });

  const { data: billItems } = useQuery({
    queryKey: ["customer-booking-bill-items", bookingId],
    queryFn: () => CustomerBookingApi.getBillItems(bookingId),
  });
  useEffect(() => {
    if (bookingDetail?.photos && Array.isArray(bookingDetail.photos)) {
      setSelectedPhoto(bookingDetail.photos[0]);
    }
  }, [bookingDetail]);

  if (isPending) {
    return <div>Đang tải thông tin lịch hẹn...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-8 overflow-hidden">
      <div className="md:col-span-3 flex h-[95vh] overflow-y-scroll custom-scrollbar">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-col gap-2 m-2 bg-[#2d2f34] rounded-lg">
            <div className="h-[200px] overflow-hidden">
              <img
                src={bookingDetail.photoshootPackageHistory.thumbnail}
                alt=""
                className="size-full object-cover rounded-t-lg"
              />
            </div>
            <div className="flex flex-col py-2 px-4 gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">
                  {bookingDetail.photoshootPackageHistory.title}
                </div>
                <div
                  className={`${
                    bookingDetail.status === "ACCEPTED"
                      ? "text-blue-500"
                      : bookingDetail.status === "SUCCESSED"
                      ? "text-green-500"
                      : "text-yellow-500"
                  } font-normal text-sm`}
                >
                  {bookingDetail.status === "ACCEPTED"
                    ? "Đang thực hiện"
                    : bookingDetail.status === "SUCCESSED"
                    ? "Đã hoàn thành"
                    : "Chờ xác nhận"}
                </div>
              </div>
              <div className="underline underline-offset-2">
                {formatPrice(bookingDetail.photoshootPackageHistory.price)}
              </div>
              <div className="flex items-center gap-2">
                <div className="size-7 overflow-hidden rounded-full">
                  <img
                    src={bookingDetail.user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>{bookingDetail.user.name}</div>
                <Tooltip title="Nhắn tin" color="blue">
                  <MessageCircleMore
                    className="w-5 h-5 ml-2 hover:text-blue-500 z-20"
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(`/message?to=${bookingDetail.user.id}`);
                    }}
                  />
                </Tooltip>
              </div>
              <div className="flex flex-col mt-2 gap-1">
                <div>Ghi chú</div>
                <p className="list-inside font-normal truncate text-sm max-w-[300px]">
                  {bookingDetail.description || "Không có"}
                </p>
                <div className="flex flex-col mt-2 gap-1">
                  <div>Thời gian hẹn:</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div className="font-normal text-sm">
                      {FormatDateTime(bookingDetail.startDate)}
                    </div>
                    <ArrowRight className="w-4 h-4" />
                    <div className="font-normal text-sm">
                      {FormatDateTime(bookingDetail.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mx-2 p-4 bg-[#2d2f34] rounded-lg">
            <div className="flex flex-col">
              <ul className="border-b pb-2">
                {billItems &&
                  billItems.objects?.map((bill) => (
                    <li
                      key={bill.id}
                      className="flex items-center justify-between font-normal text-sm"
                    >
                      <span>{bill.title}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`${
                            bill.type === "INCREASE"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {bill.type === "INCREASE" ? "+" : "-"}
                          {formatPrice(bill.price)}
                        </span>
                        <div className="w-8"></div>
                      </div>
                    </li>
                  ))}
              </ul>
              <div className="grid grid-cols-10 font-normal text-sm py-1">
                <p className="col-span-6">Tổng cộng:</p>
                <p className="col-span-3 text-end text-base mx-2">
                  <span>{formatPrice(bookingDetail.totalBillItem)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 flex flex-col h-[95vh]">
        <div
          className={`${
            bookingDetail.photos.length === 0 && "hidden"
          } bg-[#292b2f] p-7 relative flex justify-center items-center overflow-hidden`}
        >
          {bookingDetail.photos.length > 1 && (
            <>
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10">
                <ArrowLeftOutlined />
              </div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10">
                <ArrowRightOutlined />
              </div>
            </>
          )}
          <img
            src={selectedPhoto?.signedUrl.url}
            className="h-[444px] shadow-gray-600 shadow-xl drop-shadow-none z-0"
            alt="Selected Photo"
          />
        </div>
        <div className="flex overflow-x-scroll custom-scrollbar w-full bg-[#36393f]">
          {bookingDetail.photos &&
            bookingDetail.photos.toReversed().map((photo, index) => (
              <div key={index} className="relative p-2 flex-shrink-0">
                <img
                  src={photo?.signedUrl.url}
                  className={`w-[150px] h-[150px] object-cover rounded-md cursor-pointer ${
                    photo?.id === selectedPhoto?.id
                      ? "border-4 border-white transition duration-300"
                      : ""
                  }`}
                  alt="Ban Thao"
                  onClick={() => setSelectedPhoto(photo)}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetail;
