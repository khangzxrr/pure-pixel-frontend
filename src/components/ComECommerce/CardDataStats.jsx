import React from "react";
import { FaArrowUp } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";

const CardDataStats = ({
  icon,
  dataCount,
  label,
  percent,
  iconPercent,
  colorPercent,
}) => {
  return (
    <div className="bg-[#32353b] text-[#eee] flex flex-col  p-6 rounded-sm">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-[#44484f] rounded-full ">{icon}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-xl">{dataCount}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#7f848e]">{label}</div>
          <div className={`text-sm ${colorPercent} flex gap-1 items-center`}>
            {iconPercent}
            {percent}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
