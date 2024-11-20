import React, { useState } from "react";
import BookingDetailBill from "./BookingDetailBill";
import {
  ArrowRight,
  Calendar,
  Pencil,
  MessageCircleMore,
  Check,
  X,
} from "lucide-react";
import formatPrice from "../../../utils/FormatPriceUtils";
import { FormatDateTime } from "../../../utils/FormatDateTimeUtils";
import { ConfigProvider, DatePicker, Popconfirm, Tooltip } from "antd";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { photoShootInput } from "../../../yup/PhotoShootInput";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "./BookingDetail.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PhotoShootApi from "../../../apis/PhotoShootApi";
import { useNavigate } from "react-router-dom";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import { notificationApi } from "../../../Notification/Notification";
import ReviewBooking from "../../../pages/UserProfile/Component/ReviewBooking";

const { RangePicker } = DatePicker; // Destructure RangePicker from DatePicker
dayjs.locale("vi");

const BookingDetailInfo = ({ bookingDetail }) => {
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const enableUpdate = bookingDetail.status === "ACCEPTED";
  console.log(bookingDetail);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(photoShootInput),
    defaultValues: {
      description: bookingDetail.description,
      dateRange: [
        bookingDetail.startDate ? dayjs(bookingDetail.startDate) : dayjs(),
        bookingDetail.endDate ? dayjs(bookingDetail.endDate) : dayjs(),
      ],
    },
  });
  const setBookingPaidMutation = useMutation({
    mutationFn: () => PhotographerBookingApi.paidBooking(bookingDetail.id),
    onSuccess: () => {
      queryClient.invalidateQueries("booking-photographer-detail");
      queryClient.invalidateQueries("get-all-photographer-booking");
      navigate("/profile/booking-request");
      notificationApi(
        "success",
        "Thành công",
        "Đơn chụp ảnh đã được thực hiện xong"
      );
      setIsEdit(false);
    },
  });
  const handleOnConfirm = () => {
    console.log("Booking completed");
    setBookingPaidMutation.mutate();
  };
  const updateBookingDetail = useMutation({
    mutationFn: ({ description, startDate, endDate }) => {
      console.log("bookingDetail.id", description, startDate, endDate);
      return PhotoShootApi.updateBooking(bookingDetail.id, {
        description,
        startDate,
        endDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["booking-bill-items", bookingDetail.id]);
      setIsEdit(false);
    },
  });
  const handleOk = (data) => {
    updateBookingDetail.mutate({
      description: data.description,
    });
  };

  return (
    <div className="flex flex-col gap-1  w-full">
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
              } font-normal text-sm text-blue-500`}
            >
              {bookingDetail.status === "ACCEPTED"
                ? "Đang thực hiện"
                : bookingDetail.status === "SUCCESSED"
                ? "Đã hoàn thành"
                : "Chờ xác nhận"}{" "}
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
          {bookingDetail && (
            <div className="flex flex-col mt-2 gap-1">
              {!isEdit ? (
                <div>
                  {enableUpdate && (
                    <div className="flex justify-end -mb-3 z-20">
                      <Tooltip title="Sửa" color="blue">
                        <Pencil
                          className="w-5 h-5 text-blue-500 hover:cursor-pointer"
                          onClick={() => setIsEdit(true)}
                        />
                      </Tooltip>
                    </div>
                  )}

                  <p>Ghi chú</p>
                  <p className="list-inside font-normal truncate text-sm max-w-[300px]">
                    {bookingDetail.description
                      ? bookingDetail.description
                      : "Không có"}
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
              ) : (
                <ConfigProvider
                  theme={{
                    components: {
                      DatePicker: {
                        activeBg: "#292b2f",
                        activeBorderColor: "#292b2f",
                        multipleItemColorDisabled: "#292b2f",
                      },
                    },
                  }}
                  locale={{ locale: "vi" }}
                >
                  <form onSubmit={handleSubmit(handleOk)}>
                    <div className="flex justify-end -mb-3 z-20">
                      <Tooltip title="Hủy" color="red">
                        <X
                          className="w-6 h-6 mx-1 text-red-500 hover:cursor-pointer"
                          onClick={() => setIsEdit(false)}
                        />
                      </Tooltip>
                      <Tooltip title="Lưu" color="green">
                        <button
                          type="submit"
                          className="w-6 h-6 mx-1 text-green-500 hover:cursor-pointer"
                        >
                          <Check />
                        </button>
                      </Tooltip>
                    </div>
                    <p>Ghi chú</p>
                    <input
                      {...register("description")}
                      type="text"
                      className={`m-2 w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 py-1 border-[1px] text-sm font-normal focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] rounded-md ${
                        errors.title ? "border-red-500" : "border-[#4c4e52]"
                      }`}
                      placeholder="Nhập dịch vụ thêm"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs">
                        {errors.title.message}
                      </p>
                    )}
                    <div className="flex flex-col gap-2 mt-2">
                      <div>Thời gian hẹn:</div>
                      <div className="flex gap-1 font-normal items-center text-sm">
                        <Calendar className="w-4 h-4" />
                        <div>
                          {FormatDateTime(bookingDetail.startDate)} -{" "}
                          {FormatDateTime(bookingDetail.endDate)}
                        </div>
                      </div>
                    </div>
                  </form>
                </ConfigProvider>
              )}
            </div>
          )}
          <div className="w-full flex justify-center my-2">
            {bookingDetail.status === "SUCCESSED" ? (
              <p className="w-full  text-green-500 rounded-lg text-center py-2 px-2">
                Khách đã thanh toán
              </p>
            ) : (
              <Popconfirm
                title={`${
                  isEdit
                    ? "Thông tin gói chụp đang chỉnh sửa"
                    : '"Xác nhận thanh toán"'
                }`}
                description={`${
                  isEdit
                    ? "Thông tin đang sửa sẽ không được lưu lại, bạn có muốn tiếp tục không?"
                    : "Bạn có chắc là khách đã thanh toán hóa đơn này chưa?"
                }`}
                okText="Có"
                cancelText="Hủy"
                onConfirm={handleOnConfirm}
              >
                <button className="w-full bg-[#eee] text-[#202225] rounded-lg hover:bg-[#b3b3b3] justify-center py-2 px-2 transition duration-200">
                  Khách đã thanh toán
                </button>{" "}
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
      <BookingDetailBill
        bookingDetail={bookingDetail}
        enableUpdate={enableUpdate}
      />
      {/* {bookingDetail.status === "SUCCESSED" && (
        <ReviewBooking
          bookingId={bookingDetail.bookingId}
          userReview={bookingDetail ? bookingDetail.reviews[0] : ""}
          role="photographer"
        />
      )} */}
    </div>
  );
};

export default BookingDetailInfo;
