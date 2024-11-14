import React from "react";

const UpgradePackageCard = () => {
  return (
    <div className="flex flex-col gap-2 bg-[#292b2f] p-2 px-5 rounded-md">
      <div className="flex items-center justify-between">
        <div className="font-bold text-lg text-yellow-500">GÓI CAO CẤP</div>
        <div className="font-normal text-sm text-yellow-500">Phổ biến nhất</div>
      </div>

      <div className="font-bold text-lg ">
        300.000đ/ <span className="text-sm font-normal">3 tháng</span>
      </div>
      <div className="flex flex-col gap-2 mt-2 ">
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          10 gói dịch vụ
        </div>
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          50 ảnh/album
        </div>
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          70 ảnh có thể bán
        </div>
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          10 gói dịch vụ
        </div>{" "}
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          50 ảnh/album
        </div>
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          70 ảnh có thể bán
        </div>
      </div>
      <div className="flex items-center justify-center mt-5 mb-3">
        <button className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200">
          Nâng cấp
        </button>
      </div>
    </div>
  );
};

export default UpgradePackageCard;
