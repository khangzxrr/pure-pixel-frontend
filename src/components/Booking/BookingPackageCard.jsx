import { MessageCircleMore } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const BookingPackageCard = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col group h-auto  bg-[#36393f] rounded-lg overflow-hidden">
      <div className="h-[200px] overflow-hidden rounded-t-lg relative">
        <img
          src="https://picsum.photos/seed/picsum/1920/1080"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 w-full p-2 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-200 ease-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                <img
                  src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate max-w-[100px] hover:underline underline-offset-2 hover:cursor-pointer sm:max-w-[150px] text-sm sm:text-base">
                Trung Nguyen
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="px-2 py-1 text-[12px]  rounded-full border hover:bg-[#4f545c]">
                Theo dõi
              </button>
              <div className="hover:cursor-pointer">
                <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => navigate(`/explore/booking-package/${123}`)}
        className="flex flex-col gap-2 px-4 py-2 hover:cursor-pointer"
      >
        <div className="text-lg sm:text-2xl font-semibold">
          Gói chụp cá nhân
        </div>
        <div className="font-normal text-base sm:text-lg">1.000.000đ</div>
        <div>
          <div className="text-sm sm:text-base font-semibold">Sản phẩm:</div>
          <div className="font-normal text-xs sm:text-sm">
            <ul className="list-disc list-inside">
              <li>20 file ảnh </li>
              <li>1 album khổ 20x30 (hoặc 25x35) 10 tờ tương đương 20 trang</li>
              <li>1 ảnh cổng ép gỗ 60x90cm</li>
              <li>10 ảnh chỉnh sửa và ép lụa 13x18cm</li>
              <li>1 Slideshow trình chiếu nhà hàng </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end px-4 pb-2 ">
        <span className="text-sm  font-normal text-gray-400">12 lượt thuê</span>
      </div>
    </div>
  );
};

export default BookingPackageCard;
