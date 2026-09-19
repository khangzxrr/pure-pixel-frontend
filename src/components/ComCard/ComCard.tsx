import type { MouseEventHandler, ReactNode } from "react";

type ComCardProps = {
  title?: ReactNode;
  value?: number | null;
  // accepted from callers but not used here
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  // accepted from callers but not used here
  isSelected?: boolean;
};

export default function ComCard({ title, value, onClick }: ComCardProps) {
  return (
    <div
      onClick={onClick}
      className={`  col-span-1 bg-[#2a2c32] shadow rounded-lg p-3 flex flex-col`}
    >
      <p className="text-lg text-[#b9b3b3]">{title}</p>
      <div className="flex items-center justify-between w-full cursor-pointer text-[#dddddd] hover:text-white p-2">
        <div className="w-full flex flex-row justify-between">
          <div className="w-5/6">
            {value
              ? Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}
