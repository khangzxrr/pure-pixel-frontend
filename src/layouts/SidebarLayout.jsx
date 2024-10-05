// SidebarLayout.js
import React from "react";
import { IoMenu, IoSettingsSharp } from "react-icons/io5";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const SidebarLayout = ({
  isSidebarOpen,
  toggleSidebar,
  userData,
  activeIcon,
  activeTitle,
  activeQuote,
  sidebarContent,
  onLogout,
  onLogin,
  onRegister,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-grow max-h-screen">
      <div className="flex">
        <div
          className={` ${
            isSidebarOpen ? "flex" : "hidden"
          } xl:flex flex-col w-[256px] bg-[#2f3136] max-h-screen sticky top-0 z-40`}
        >
          <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
            {sidebarContent}
          </div>
          <div className="sticky bottom-0 bg-[#2a2d31] p-[12.5px]">
            {userData ? (
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#36393f] py-[5px] px-[5px] rounded-md transition-colors duration-300"
                >
                  <div className="w-[34px] h-[34px] overflow-hidden rounded-full">
                    <img
                      src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[13px]">{userData.name}</div>
                </div>
                <div className="hover:cursor-pointer px-[5px] rounded-md">
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <MenuButton className="flex w-full items-center justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900">
                        <IoSettingsSharp
                          aria-hidden="true"
                          className="-mr-1 h-7 w-7 text-[#eee]"
                        />
                      </MenuButton>
                    </div>
                    <MenuItems className="absolute right-0 z-10 mt-2 w-28 -top-14 origin-top-right divide-y divide-gray-100 rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none">
                      <div className="py-1">
                        <MenuItem>
                          <div
                            onClick={onLogout}
                            className="flex px-4 py-2 text-sm text-[#eee]"
                          >
                            Đăng xuất
                          </div>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={onRegister}
                  className="bg-[#eee] text-gray-500 hover:bg-[#b8b8b8] transition-colors duration-200 rounded-md px-5 py-1"
                >
                  Đăng ký
                </button>
                <button
                  onClick={onLogin}
                  className="outline outline-1 outline-[#eee] hover:bg-[#5f5f5f91] transition-colors duration-200 text-[#eee] rounded-md px-5 py-1"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow overflow-y-auto scrollbar scrollbar-width: thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
        <div className="sticky top-0 px-2 z-50 flex justify-between items-center border-b-2 border-[#1d1f22] bg-[#36393f] bg-opacity-80 backdrop-blur-md h-[52px] py-3 w-full">
          <div className=" flex items-center space-x-4">
            <IoMenu size={24} className="xl:hidden" onClick={toggleSidebar} />
            <div className="flex gap-2 items-center lg:items-end">
              <div className="flex items-center gap-2 pr-4 border-r-[1px] border-[#777777]">
                <div className="text-2xl">{activeIcon}</div>
                <div className="hidden 2xl:block">{activeTitle}</div>
              </div>
              <div className="text-sm font-normal pl-2 text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[300px] lg:max-w-none">
                {activeQuote}
              </div>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
