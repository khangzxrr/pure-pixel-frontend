import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoCalendarOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";

const LocationDetail = ({ location, dateTime, title, description }) => {
  const date = new Date(dateTime);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedDate = ` ${hours}:${minutes} ${day}/${month}/${year}`;

  return (
    <div className="flex flex-col bg-white p-5 gap-5 shadow-lg rounded-lg">
      <div className="flex flex-col gap-3">
        <p className="text-xl font-bold">{title || "Tiêu đề không xác định"}</p>
        <p className="text-sm">{description || "Mô tả không xác định"}</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <HiOutlineLocationMarker className="text-xl" />
          <p className="ml-2">{location || "Không xác định"}</p>
        </div>
        <div className="flex items-center">
          <IoCalendarOutline className="text-xl" />
          <p className="ml-2">{formattedDate || "Không xác định"}</p>
        </div>
        <div className="flex items-center">
          <FaRegHeart className="text-xl" />
          <p className="ml-2">216 yêu thích</p>
        </div>
        <div className="flex items-center">
          <FaRegEye className="text-xl" />
          <p className="ml-2">3.9k lượt xem</p>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
