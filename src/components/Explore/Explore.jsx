import React from "react";
import { Outlet } from "react-router-dom";
import InspirationSideComp from "../Inspiration/InspirationSide/InspirationSideComp";

import { IoMenu } from "react-icons/io5";
import UseInspirationStore from "../../states/UseInspirationStore";

const Explore = () => {
  const { isSidebarOpen, toggleSidebar, activeTitle, activeIcon, activeQuote } =
    UseInspirationStore();

  return (
    <div className="flex flex-grow max-h-screen">
      {/* Sidebar - Right */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } xl:flex flex-col w-[256px] bg-[#36393f] max-h-screen sticky top-0 z-40`}
      >
        <InspirationSideComp />
      </div>
      <div id="inspiration" className="flex flex-col flex-grow overflow-y-auto">
        <div className="sticky top-0 px-2 z-50 flex justify-between items-center bg-[#36393f] bg-opacity-80 backdrop-blur-md h-[52px] py-3 w-full">
          <div className="relative flex items-center space-x-4">
            <IoMenu size={24} className="xl:hidden" onClick={toggleSidebar} />{" "}
            <div className="flex gap-2 items-center lg:items-end">
              <div className="flex items-center gap-2 pr-4  border-r-[1px] border-[#777777]">
                <div className="text-2xl">{activeIcon}</div>
                <div className="hidden 2xl:block">{activeTitle}</div>
              </div>
              <div className="text-sm font-normal pl-2 text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[300px] lg:max-w-none">
                {activeQuote}
              </div>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm PurePixel..."
              className="p-2 pl-4 bg-gray-700 rounded-lg text-white focus:outline-none"
            />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Explore;
