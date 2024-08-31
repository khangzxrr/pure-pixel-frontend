import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoCalendarOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
const LocationDetail = () => {
  return (
    <div className="flex flex-col bg-white p-5 gap-5 shadow-lg rounded-lg">
      <div className="flex flex-col gap-3">
        <p className="text-xl font-bold">Truyền dữ liệu </p>
        <p className="text-sm">
          Một người đang sử dụng máy tính xách tay để truyền dữ liệu đến và đi
          từ nhiều thiết bị lưu trữ ngoài,...{" "}
          <span className="text-blue-500 hover:underline hover:cursor-pointer">
            đọc thêm
          </span>
          .
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center ">
          <HiOutlineLocationMarker className="text-xl" />
          <p className="ml-2">Việt Nam</p>
        </div>
        <div className="flex items-center ">
          <IoCalendarOutline className="text-xl" />
          <p className="ml-2">6:00 18/03/2024</p>
        </div>
        <div className="flex items-center ">
          <FaRegHeart className="text-xl" />
          <p className="ml-2">216 yêu thích</p>
        </div>
        <div className="flex items-center ">
          <FaRegEye className="text-xl" />
          <p className="ml-2">3.9k lượt xem</p>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
