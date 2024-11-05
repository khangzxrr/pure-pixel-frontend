import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import InspirationSideComp from "../Inspiration/InspirationSide/InspirationSideComp";
import { IoMenu, IoSettingsSharp } from "react-icons/io5";
import UseInspirationStore from "../../states/UseInspirationStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UseSidebarStore from "../../states/UseSidebarStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import InspirationNav from "../Inspiration/InspirationNav/InspirationNav";
import PhotographerNav from "../Photographer/PhotographerList/PhotographerNav";
import SellingPhotoNav from "../SellingPhoto/SellingPhotoNav";
import UserApi from "../../apis/UserApi";
import { useQuery } from "@tanstack/react-query";
import { IoIosArrowUp } from "react-icons/io";
const Explore = () => {
  const navigate = useNavigate();
  const { activeTitle, activeIcon, activeQuote, activeItem } =
    UseInspirationStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const [isVisible, setIsVisible] = useState(false);
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();

  const isInspirationActive = activeItem === 1;
  const isPhotographerListActive = activeItem === 4;
  const isSellingListActive = activeItem === 6;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });
  const handleScroll = () => {
    const scrollTop = document.getElementById("inspiration").scrollTop;
    setIsVisible(scrollTop > 300);
  };

  const scrollToTop = () => {
    document
      .getElementById("inspiration")
      .scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const mainDiv = document.getElementById("inspiration");
    mainDiv.addEventListener("scroll", handleScroll);
    return () => {
      mainDiv.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="flex flex-grow max-h-screen ">
      <div className="flex w-full">
        <div
          className={`flex flex-col bg-[#2f3136] transition-all duration-200 lg:w-64 ${
            isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
          } lg:overflow-visible`}
        >
          {/* <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]"> */}
          <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
            <InspirationSideComp />
          </div>
          <div className="sticky bottom-0 bg-[#2a2d31] p-[12.5px]">
            {userData ? (
              <div className="flex items-center justify-between gap-2 ">
                <div
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 hover:cursor-pointer hover:bg-[#36393f] py-[5px] px-[5px] rounded-md"
                >
                  <div className="w-[34px] h-[34px] overflow-hidden rounded-full">
                    <img
                      src={`${data?.avatar}`}
                      alt="avatar"
                      className="w-full h-full object-cover bg-[#eee]"
                    />
                  </div>
                  <div className="text-[13px]">{userData.name}</div>
                </div>
                <div className="hover:cursor-pointer  px-[5px] rounded-md">
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
                      className="absolute right-0 z-10 mt-2 w-28 -top-14 origin-bottom-right divide-y divide-gray-100 
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
        <div className="flex flex-col flex-grow w-full">
          <div
            id="inspiration"
            className={`flex flex-col l  relative 
       custom-scrollbar ${
         isSidebarOpen ? `overflow-hidden` : `overflow-y-scroll`
       }`}
          >
            <div className="sticky top-0 px-2 z-10 flex  items-center bg-[#36393f] bg-opacity-80 backdrop-blur-md h-[52px] py-3 w-full">
              <div className="hover:bg-[#4e535e] p-1 rounded-full transition-colors duration-200">
                <IoMenu
                  size={24}
                  className="lg:hidden hover:cursor-pointer "
                  onClick={toggleSidebar}
                />{" "}
              </div>

              {isInspirationActive && (
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
              {isSellingListActive && (
                <SellingPhotoNav
                  activeTitle={activeTitle}
                  activeIcon={activeIcon}
                  activeQuote={activeQuote}
                />
              )}
            </div>
            <Outlet />
            {isVisible && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-5 right-10 z-20 bg-[#4e535e] border-2 hover:bg-[#777777] text-white p-2 rounded-full transition-colors duration-200"
              >
                <IoIosArrowUp size={24} />
              </button>
            )}
            {isSidebarOpen && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                style={{ height: "9999px" }}
                onClick={toggleSidebar}
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
