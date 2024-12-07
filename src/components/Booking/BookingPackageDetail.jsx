import { MessageCircleMore, Share2 } from "lucide-react";
import React, { useState } from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import BookingModal from "./../../pages/BookingPage/component/BookingModal";
import ChatButton from "../ChatButton/ChatButton";

const formatNumber = (number) => {
  return new Intl.NumberFormat("de-DE").format(number);
};
const PhotoshootPackageInfo = ({ photoshootPackage, userData, onLogin }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false); // Hàm đóng modal
  };

  return (
    <>
      {isModalVisible && (
        <BookingModal photoPackage={photoshootPackage} onClose={hideModal} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#292b2f] rounded-lg">
        <div className="overflow-hidden h-[600px] rounded-none md:rounded-l-lg ">
          <img
            src={photoshootPackage.thumbnail}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 py-4 px-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="size-10 overflow-hidden rounded-full">
                <img
                  src={photoshootPackage.user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>{photoshootPackage.user.name}</div>
            </div>
            <div className="flex items-center gap-3">
              {/* <button className="px-2 py-1 text-[12px]  rounded-full border hover:bg-[#4f545c]">
                Theo dõi
              </button> */}
              {photoshootPackage.user.id !== userData?.sub && (
                <ChatButton userId={photoshootPackage.user.id} />
              )}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="text-xl font-semibold">Gói chụp hình cá nhân</div>
            {/* <Share2 className="w-5 h-5 hover:cursor-pointer" /> */}
          </div>
          <div className="font-normal">
            {formatPrice(photoshootPackage.price)}
          </div>
          <div className="font-normal text-sm text-gray-400">
            {photoshootPackage._count.bookings
              ? formatNumber(photoshootPackage._count.bookings)
              : "Chưa có"}{" "}
            lượt thuê
          </div>
          <div className="flex flex-col gap-1 p-2 border font-normal border-gray-600 rounded-lg">
            {photoshootPackage.description}
          </div>
          {userData ? (
            <button
              onClick={showModal}
              className="bg-[#eee] text-center p-2 text-[#202225] rounded-lg hover:bg-[#b3b3b3] transition duration-300"
            >
              Đặt lịch
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="bg-[#eee] text-center p-2 text-[#202225] rounded-lg hover:bg-[#b3b3b3] transition duration-300"
            >
              Đăng nhập để đặt lịch
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PhotoshootPackageInfo;
