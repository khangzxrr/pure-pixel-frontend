import React from "react";

const MyPhotoshootPackageCard = () => {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#36393f] group hover:cursor-pointer">
      <div className="h-[150px] overflow-hidden rounded-t-lg">
        <img
          src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
          alt="demo"
          className="size-full object-cover  group-hover:scale-125 transition-all duration-300 ease-in-out"
        />
      </div>
      <div className="flex flex-col gap-1 px-2">
        <div className=" text-2xl">Tiêu đề</div>
        <div className="font-normal underline underline-offset-2">200.000đ</div>
        <div className="flex flex-col mt-2">
          <div>Mô tả chung</div>
          <ul className="list-disc list-inside font-normal text-sm h-[50px] truncate">
            <li>Trang điểm</li>
            <li>Trang điểm</li>
          </ul>
        </div>
      </div>
      <div className=" flex items-center justify-between p-2 text-sm font-normal text-[#9ca3af]">
        <div>Thời gian tạo: 12/12/2023</div>
        <div>12 lượt thuê</div>
      </div>
    </div>
  );
};

export default MyPhotoshootPackageCard;
