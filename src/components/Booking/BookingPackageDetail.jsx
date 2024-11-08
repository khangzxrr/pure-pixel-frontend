import { MessageCircleMore, Share2 } from "lucide-react";
import React from "react";

const BookingPackageDetail = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#292b2f] rounded-lg">
      <div className="overflow-hidden h-[600px] rounded-none md:rounded-l-lg ">
        <img
          src="https://picsum.photos/seed/picsum/1920/1080"
          alt=""
          className="size-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-3 py-4 px-6">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-10 overflow-hidden rounded-full">
              <img
                src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>Trung Nguyen</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-2 py-1 text-[12px]  rounded-full border hover:bg-[#4f545c]">
              Theo dõi
            </button>
            <div className="hover:cursor-pointer">
              <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start">
          <div className="text-xl font-semibold">Gói chụp hình cá nhân</div>
          <Share2 className="w-5 h-5 hover:cursor-pointer" />
        </div>
        <div className="font-normal">1.000.000đ</div>
        <div className="font-normal text-sm text-gray-400">12 lượt thuê</div>
        <div className="flex flex-col gap-1 p-2 border border-gray-600 rounded-lg">
          <div className="text-base">Trang phục:</div>
          <ul className="list-disc list-inside text-sm font-normal">
            <li>2 váy cưới (trong đó có 1 dòng váy bất kì)</li>
            <li>2 bộ Vest (Áo jacket, áo ghile, quần tây & phụ kiện)</li>
          </ul>
        </div>
        <div className="flex flex-col gap-1 p-2 border border-gray-600 rounded-lg">
          <div className="text-base">Dịch vụ:</div>
          <ul className="list-disc list-inside text-sm font-normal">
            <li>1 lần trang điểm và làm tóc tại Studio</li>
          </ul>
        </div>
        <div className="flex flex-col gap-1 p-2 border border-gray-600 rounded-lg">
          <div className="text-base">Sản phẩm:</div>
          <ul className="list-disc list-inside text-sm font-normal">
            <li>20 file ảnh </li>
            <li>1 album khổ 20x30 (hoặc 25x35) 10 tờ tương đương 20 trang</li>
            <li>1 ảnh cổng ép gỗ 60x90cm</li>
            <li>10 ảnh chỉnh sửa và ép lụa 13x18cm</li>
            <li>1 Slideshow trình chiếu nhà hàng </li>
          </ul>
        </div>

        <button className="bg-[#eee] text-center p-2 text-[#202225] rounded-lg hover:bg-[#b3b3b3] transition duration-300">
          Đặt lịch
        </button>
      </div>
    </div>
  );
};

export default BookingPackageDetail;
