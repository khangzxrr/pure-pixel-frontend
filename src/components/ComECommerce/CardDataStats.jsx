import React from "react";
import { useNavigate } from "react-router-dom";

const CardDataStats = ({
  icon,
  dataCount,
  label,
  percent,
  iconPercent,
  colorPercent,
  link,
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(link)}
      className="bg-[#32353b] text-[#eee] flex flex-col  p-6 rounded-sm hover:scale-105 transition-all duration-200 hover:cursor-pointer"
    >
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
