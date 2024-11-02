import React from "react";

const StorageBar = ({ used, total }) => {
  const usedGB = used / 1024 ** 3;
  const totalGB = total / 1024 ** 3;
  const percentage = (usedGB / totalGB) * 100;

  return (
    <div className=" md:w-[17vw] w-[60vw] p-4 font-normal rounded-lg ">
      <div className="flex flex-col mb-2">
        <span className="text-[#eee] mb-2">
          Dung lượng đã sử dụng:{" "}
          <span className="font-semibold">{usedGB.toFixed(3)} GB </span> /{" "}
          {totalGB.toFixed(3)} GB
        </span>
        <span className="text-[#eee] text-right">{percentage.toFixed(2)}%</span>
      </div>
      <div className="w-full outline outline-2 outline-[#eee] bg-[#eee] rounded-full h-3">
        <div
          className="bg-[#777777] h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-right text-[#eee] mt-1">
        Còn lại: {(totalGB - usedGB).toFixed(2)} GB
      </div>
    </div>
  );
};

export default StorageBar;
