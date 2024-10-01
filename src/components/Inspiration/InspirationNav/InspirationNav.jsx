import React from "react";
import { IoMenu } from "react-icons/io5";
import Categories from "../../Explore/Categories";

const InspirationNav = ({
  toggleSidebar,
  activeIcon,
  activeTitle,
  activeQuote,
}) => {
  return (
    <>
      <div className="relative flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-end">
          <div className="flex items-center gap-2 pr-4   border-r-[1px] border-[#777777]">
            <div className="text-2xl">{activeIcon || "#"}</div>
            <div className="hidden 2xl:block">{activeTitle}</div>
          </div>
          <div className="text-sm font-normal pl-2 text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[300px] lg:max-w-none">
            {activeQuote}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="">
          <input
            type="text"
            placeholder="Tìm kiếm PurePixel..."
            className="font-normal text-sm px-2 py-2 w-[300px] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
          />
        </div>
        <div className="">
          <Categories />
        </div>
      </div>
    </>
  );
};

export default InspirationNav;
