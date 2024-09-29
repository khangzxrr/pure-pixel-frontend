import React from "react";
import { Outlet } from "react-router-dom";
import InspirationSideComp from "../Inspiration/InspirationSide/InspirationSideComp";
import { IoSettingsSharp } from "react-icons/io5";
import UseInspirationStore from "../../states/UseInspirationStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UseSidebarStore from "../../states/UseSidebarStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import InspirationNav from "../Inspiration/InspirationNav/InspirationNav";
import PhotographerNav from "../Photographer/PhotographerList/PhotographerNav";
const Explore = () => {
  const { activeTitle, activeIcon, activeQuote, activeItem } =
    UseInspirationStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();

  const isInspirationActive = activeItem === 1;
  const isPhotographerListActive = activeItem === 4;
  return (
    <div className="flex flex-grow max-h-screen">
      {/* Sidebar - Right */}
      <div className="flex">
        <div
          className={`${
            isSidebarOpen ? "flex" : "hidden"
          } xl:flex flex-col w-[256px] bg-[#36393f] max-h-screen sticky top-0 z-40`}
        >
          <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
            <InspirationSideComp />
          </div>
          <div className="sticky bottom-0 bg-[#2a2d31] p-[12.5px]">
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
                  // onClick={handleLogout}
                  className="hover:cursor-pointer  px-[5px] rounded-md"
                >
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <MenuButton className="flex w-full items-center justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold text-gray-900 ">
                        <IoSettingsSharp
                          aria-hidden="true"
                          className="-mr-1 h-7 w-7 text-[#eee]"
                        />
                      </MenuButton>
                    </div>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-24 -top-14 origin-top-right divide-y divide-gray-100 
                      rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition 
                      focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 
                      data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <div className="py-1">
                        <MenuItem>
                          <div
                            onClick={handleLogout}
                            className="flex px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#36393f] "
                          >
                            Log out
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
      </div>
      <div
        id="inspiration"
        className="flex flex-col flex-grow overflow-y-auto 
       scrollbar scrollbar-width: thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]"
      >
        <div className="sticky top-0 px-2 z-50 flex justify-between items-center bg-[#36393f] bg-opacity-80 backdrop-blur-md h-[52px] py-3 w-full">
          {isInspirationActive && ( // Chỉ hiển thị InspirationNav khi activeItem là "Cảm hứng"
            <InspirationNav
              toggleSidebar={toggleSidebar}
              activeTitle={activeTitle}
              activeIcon={activeIcon}
              activeQuote={activeQuote}
            />
          )}
          {isPhotographerListActive && (
            <PhotographerNav
              toggleSidebar={toggleSidebar}
              activeTitle={activeTitle}
              activeIcon={activeIcon}
              activeQuote={activeQuote}
            />
          )}
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Explore;
