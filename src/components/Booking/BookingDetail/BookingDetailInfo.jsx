import React from "react";
import BookingDetailBill from "./BookingDetailBill";
import { Calendar, FilePenLine } from "lucide-react";
import formatPrice from "../../../utils/FormatPriceUtils";

const BookingDetailInfo = ({ bookingDetail }) => {
  console.log(bookingDetail);

  return (
    <div className="flex flex-col gap-1 ">
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
            <div className="font-normal text-sm text-blue-500">
              Đang thực hiện
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
          </div>
          <div className="flex flex-col mt-2 gap-1">
            <div>Ghi chú:</div>
            <ul className="list-disc list-inside font-normal text-sm">
              <li>{bookingDetail.description}</li>
            </ul>
          </div>

          <div className="flex flex-col mt-2 gap-1">
            <div>Thời gian hẹn:</div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div className="font-normal text-sm">
                {bookingDetail.startDate}
              </div>
              <div className="font-normal text-sm">{bookingDetail.endDate}</div>
            </div>
          </div>

          <div className="flex flex-col mt-2 gap-1 ">
            <div className="flex items-center gap-2">
              <div>Hóa đơn:</div>
              <FilePenLine className="w-5 h-5 text-blue-500" />
            </div>
            <div className="px-3 border-b border-spacing-2 pb-3">
              <ul className="list-disc list-inside font-normal text-sm">
                {bookingDetail.billItems?.map((bi) => {
                  return (
                    <li className="flex justify-between">
                      • {bi.title}{" "}
                      <span className="">{formatPrice(bi.price)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="font-normal text-sm">Tổng cộng</div>
              <div className="font-normal text-sm">1.600.000đ</div>
            </div>
          </div>
          <div className="text-right font-normal text-sm text-gray-500">
            12 giờ trước
          </div>
          <button className="flex items-center bg-[#eee] text-[#202225] rounded-lg hover:bg-[#b3b3b3] justify-center py-2">
            Khách đã thanh toán
          </button>
        </div>
      </div>
      <BookingDetailBill />
    </div>
  );
};

export default BookingDetailInfo;
