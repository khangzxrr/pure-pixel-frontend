import React from "react";
import { FaEdit } from "react-icons/fa";
import formatPrice from "../../utils/FormatPriceUtils";
import calculateDateDifference from "../../utils/calculateDateDifference";
import { PiWarningOctagonFill } from "react-icons/pi";

const MyPhotoshootPackageDetailInfo = ({
  photoshootPackage,
  setIsUpdatePhotoshootPackageModal,
  setSelectedUpdatePhotoshootPackage,
}) => {
  console.log("photoshootPackage", photoshootPackage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 rounded-lg gap-5 bg-[#292b2f] overflow-hidden">
      <div className="h-[500px] overflow-hidden">
        <img
          src={photoshootPackage?.thumbnail}
          alt=""
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-col  py-2 pr-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex flex-col  gap-2">
            <div className="text-xl">{photoshootPackage.title}</div>
            <div className="text-[#9ca3af] text-sm font-light">
              {photoshootPackage.subtitle}
            </div>
          </div>

          {photoshootPackage?.status === "ENABLED" ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsUpdatePhotoshootPackageModal(true);
                setSelectedUpdatePhotoshootPackage(photoshootPackage.id);
              }}
              className="font-normal flex items-center gap-2 px-2 py-1 bg-[#19191b] text-[#5699ff] rounded-md hover:opacity-80"
            >
              <FaEdit className="size-5" />
              Chỉnh sửa
            </button>
          ) : (
            <div className="font-normal flex items-center gap-2 px-2 py-1 bg-red-500 text-white rounded-md ">
              <PiWarningOctagonFill className="size-5" />
              Gói dịch vụ này đã bị vô hiệu hóa
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center mt-2">
            <div>Giá gói:</div>
            <div className="font-normal text-lg underline underline-offset-2 ">
              {photoshootPackage ? formatPrice(photoshootPackage.price) : 0}
            </div>
          </div>

          <div className="flex flex-col gap-1 font-normal">
            <div className="font-semibold">Mô tả:</div>
            {photoshootPackage.description}
          </div>
        </div>

        <div className="flex items-end h-full justify-between">
          <div className="font-normal  text-[#9ca3af]">
            Tạo {calculateDateDifference(photoshootPackage.createdAt)}
          </div>
          <div className="font-normal  text-[#9ca3af]">
            {photoshootPackage._count.bookings} lượt thuê
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPhotoshootPackageDetailInfo;
