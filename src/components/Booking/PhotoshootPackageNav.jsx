import React from "react";
import { FaSearch } from "react-icons/fa";

const PhotoshootPackageNav = ({
  toggleSidebar,
  activeIcon,
  activeTitle,
  activeQuote,
}) => {
  return (
    <div className="relative flex items-center justify-between  space-x-4 w-full">
      <div className="relative flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-end">
          <div className="flex items-center gap-2 pr-4   border-r-[1px] border-[#777777]">
            <div className="text-2xl pl-2">{activeIcon || "#"}</div>
            <div className="hidden lg:block">{activeTitle}</div>
          </div>
          {/* <div className="text-sm font-normal pl-2 text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[300px] lg:max-w-none">
    {activeQuote}
  </div> */}
        </div>
      </div>
      {/* <div className="flex items-center gap-2 transition-all duration-300">
        <div className="bg-[#202225] rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Tìm kiếm PurePixel..."
            className="font-normal text-sm px-2 py-2 w-[50vw] lg:w-[20vw]  pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
          />
          <div className="flex items-center px-3">
            <button className="">
              <FaSearch />
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PhotoshootPackageNav;
