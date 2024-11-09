import { Calendar, MessageCircleMore } from "lucide-react";
import React, { useState } from "react";
import BookingRejectWarningModel from "./BookingRejectWarningModel";
import { useNavigate } from "react-router-dom";

const BookingRequestCard = ({
  state,
  colorStateText,
  isPending,
  isCompleted,
  isCanceled,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };
  return (
    <>
      {isModalVisible && (
        <BookingRejectWarningModel onClose={handleHideModal} />
      )}
      <div className="flex flex-col group h-auto  bg-[#36393f] rounded-lg overflow-hidden pb-2">
        <div className="h-[200px] overflow-hidden rounded-t-lg relative">
          <img
            src="https://picsum.photos/1920/1080"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div
          // onClick={() => }
          className="flex flex-col gap-1 px-4 py-2 hover:cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">tiêu đề</div>
            <div className={`text-[12px] font-normal ${colorStateText}`}>
              {state}
            </div>
          </div>

          <div className="font-normal text-base sm:text-lg underline underline-offset-2">
            1.000.000đ
          </div>

          <div className="flex item-center gap-2 mt-2">
            <div className="size-5 overflow-hidden rounded-full ">
              <img
                src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm ">Tên người thuê</div>
            <MessageCircleMore className="w-5 h-5 ml-2" />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <div>Ghi chú:</div>
            <ul className="list-disc list-inside font-normal ">
              <li className="truncate text-sm max-w-[300px]">
                Tôi muốn chụp concept tuổi thơ cá tính
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div>Thời gian hẹn:</div>
            <div className="flex gap-1 font-normal items-center text-sm">
              <Calendar className="w-4 h-4" />
              <div>22 tháng 8 2024, 09:00 AM</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 p-2 px-5">
          {!isCompleted && !isCanceled && (
            <button
              onClick={handleShowModal}
              className="transition duration-300 text-red-500 border border-red-500 w-full px-2 py-1 rounded-lg hover:text-[#eee] hover:bg-red-500"
            >
              Từ chối
            </button>
          )}

          {isPending && (
            <button
              onClick={() => navigate(`/profile/booking/${123}`)}
              className="transition duration-300 bg-[#eee] text-[#202225] w-full px-2 py-1 rounded-lg hover:bg-[#c0c0c0]"
            >
              Xác nhận
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingRequestCard;
