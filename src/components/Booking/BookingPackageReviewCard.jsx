import { Star } from "lucide-react";
import React from "react";

const BookingPackageReviewCard = () => {
  return (
    <div className="w-full flex flex-col bg-[#36393f] rounded-lg gap-2 p-2">
      <div className="flex gap-1 items-center pt-2">
        <Star className="text-yellow-500 w-4 h-4" />
        <Star className="text-yellow-500 w-4 h-4" />
        <Star className="text-yellow-500 w-4 h-4" />
        <Star className="text-yellow-500 w-4 h-4" />
        <Star className="text-yellow-500 w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <div>Gói chụp cá nhân</div>
        <div className="text-[12px] font-normal">Thợ chụp rất đẹp và ưng ý</div>
      </div>
      <div className="flex gap-1 items-center">
        <div className="size-6 overflow-hidden rounded-full">
          <img
            src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col ">
          <div className="text-[14px] font-normal">Trung Nguyen</div>
          <div className="text-[12px] text-gray-400 font-normal">
            08/11/2024
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPackageReviewCard;
