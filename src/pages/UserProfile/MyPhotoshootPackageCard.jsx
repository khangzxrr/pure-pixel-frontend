import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import calculateDateDifference from "../../utils/calculateDateDifference";

const MyPhotoshootPackageCard = ({ packageDetail }) => {
  console.log("packageDetail", packageDetail);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#36393f] group hover:cursor-pointer">
      <div className="h-[150px] overflow-hidden rounded-t-lg">
        <img
          src={packageDetail.thumbnail}
          alt="demo"
          className="size-full object-cover  group-hover:scale-125 transition-all duration-300 ease-in-out"
        />
      </div>
      <div className="flex flex-col gap-1 px-2">
        <div className=" text-2xl">{packageDetail.title}</div>
        <div className="font-normal underline underline-offset-2">
          {formatPrice(packageDetail.price)}
        </div>
        <div className="flex flex-col mt-2">
          <div>Mô tả chung</div>
          {packageDetail.description}
        </div>
      </div>
      <div className=" flex items-center justify-between p-2 text-sm font-normal text-[#9ca3af]">
        <div>Tạo {calculateDateDifference(packageDetail.createdAt)}</div>
        <div>{packageDetail._count.bookings} lượt thuê</div>
      </div>
    </div>
  );
};

export default MyPhotoshootPackageCard;
