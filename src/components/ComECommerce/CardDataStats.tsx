import type { MouseEventHandler, ReactNode } from "react";

type CardDataStatsProps = {
  icon?: ReactNode;
  dataCount?: ReactNode;
  label?: ReactNode;
  percent?: string | number;
  iconPercent?: ReactNode;
  colorPercent?: string;
  // accepted but not used by the card
  link?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  isScaleHover?: boolean;
};

const CardDataStats = ({
  icon,
  dataCount,
  label,
  percent,
  iconPercent,
  colorPercent,
  onClick,
  isScaleHover = true,
}: CardDataStatsProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#32353b] text-[#eee] flex flex-col  p-6 rounded-sm ${
        isScaleHover
          ? "hover:scale-105 transition-all duration-200 hover:cursor-pointer"
          : ""
      }`}
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
            {percent ? `${percent}%` : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
