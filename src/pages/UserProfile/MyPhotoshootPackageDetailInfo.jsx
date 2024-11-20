import React from "react";
import { FaEdit } from "react-icons/fa";

const MyPhotoshootPackageDetailInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 rounded-lg gap-5 bg-[#292b2f] overflow-hidden">
      <div className="h-[500px] overflow-hidden">
        <img
          src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
          alt=""
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-col  py-2 pr-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center  gap-2">
            <div className="text-xl">Gói chụp cá nhân</div>
          </div>
          <button className="font-normal flex items-center gap-2 px-2 py-1 bg-[#eee] text-[#3975ce] rounded-md">
            <FaEdit className="size-5" />
            Chỉnh sửa
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center mt-2">
            <div>Giá gói:</div>
            <div className="font-normal text-lg underline underline-offset-2 ">
              2.000.000đ
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div>Mô tả:</div>
            <ul className="list-disc list-inside  text-sm font-normal h-[250px] truncate ">
              <li>Trang điểm</li>
            </ul>
          </div>
        </div>

        <div className="flex items-end h-full justify-between">
          <div className="font-normal  text-[#9ca3af]">
            Ngày tạo: 12/12/2023
          </div>
          <div className="font-normal  text-[#9ca3af]">12 lượt thuê</div>
        </div>
      </div>
    </div>
  );
};

export default MyPhotoshootPackageDetailInfo;
