import React from "react";
import { Link, Outlet } from "react-router-dom";
import InspirationSideComp from "../Inspiration/InspirationSide/InspirationSideComp";
import { IoMenu, IoSettingsSharp } from "react-icons/io5";
import UseInspirationStore from "../../states/UseInspirationStore";
import Categories from "./Categories";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";

const Explore = () => {
  const { isSidebarOpen, toggleSidebar, activeTitle, activeIcon, activeQuote } =
    UseInspirationStore();
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();
  return (
    <div className="flex flex-grow max-h-screen">
      {/* Sidebar - Right */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } xl:flex flex-col w-[256px] bg-[#36393f] max-h-screen sticky top-0 z-40`}
      >
        <InspirationSideComp />
        <div className="flex-grow"></div>{" "}
        <div className="bg-[#2a2d31] p-[12.5px]">
          {userData ? (
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#36393f] py-[5px] px-[5px] rounded-md">
                <div className="w-[34px] h-[34px] overflow-hidden rounded-full">
                  <img
                    src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[13px]">{userData.name}</div>
              </div>
              <div
                onClick={handleLogout}
                className="hover:cursor-pointer hover:bg-[#36393f] p-[5px] rounded-md"
              >
                <IoSettingsSharp className="w-[25px] h-[25px]" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleRegister}
                className="bg-[#eee] text-gray-500 hover:bg-[#b8b8b8] transition-colors duration-200 rounded-md px-5 py-1"
              >
                Đăng ký
              </button>
              <button
                onClick={handleLogin}
                className="outline outline-1 outline-[#eee] hover:bg-[#5f5f5f91] transition-colors duration-200 text-[#eee] rounded-md px-5 py-1"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
      <div></div>
      <div
        id="inspiration"
        className="flex flex-col flex-grow overflow-y-auto 
         scrollbar scrollbar-width: thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]"
      >
        <div className="sticky top-0 px-2 z-50 flex justify-between items-center bg-[#36393f] bg-opacity-80 backdrop-blur-md h-[52px] py-3 w-full">
          <div className="relative flex items-center space-x-4">
            <IoMenu size={24} className="xl:hidden" onClick={toggleSidebar} />{" "}
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
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Explore;
