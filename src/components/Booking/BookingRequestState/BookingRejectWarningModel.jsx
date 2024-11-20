import { useMutation } from "@tanstack/react-query";
import React from "react";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import { useNotification } from "../../../Notification/Notification";

const BookingRejectWarningModel = ({ booking, onClose }) => {
  const { notificationApi } = useNotification();

  const denyBookingMutation = useMutation({
    mutationFn: () => PhotographerBookingApi.denyBooking(booking.id),
  });

  const handleDenyBooking = () => {
    denyBookingMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 w-screen overflow-y-auto ">
      <div className="w-[400px] h-[150px] bg-[#43474f] rounded-lg flex flex-col ">
        <div className="flex items-center justify-center bg-[#2b2e33] rounded-t-lg h-[50px]">
          Cảnh báo
        </div>
        <div className="flex flex-col items-center h-full justify-center ">
          <div className="flex flex-col items-center gap-2 ">
            <div className="font-normal">
              Bạn có chắc muốn <span className="font-bold">TỪ CHỐI</span> lịch
              hẹn này không?
            </div>

            {denyBookingMutation.isPending ? (
              <div>Đang huỷ đặt lịch này...</div>
            ) : denyBookingMutation.isSuccess ? (
              <div>Đã huỷ đặt lịch này thành công</div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={onClose}
                  className="px-2 py-1 rounded-lg border border-red-500 text-red-500 w-full hover:bg-red-500 hover:text-[#eee]"
                >
                  Hủy bỏ
                </button>
                <button
                  className="px-2 py-1 rounded-lg bg-[#eee] hover:bg-[#b3b3b3] text-[#202225] w-full"
                  onClick={() => handleDenyBooking()}
                >
                  Chấp nhận
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRejectWarningModel;
