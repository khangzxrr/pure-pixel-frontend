import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import InspirationSideComp from "../Inspiration/InspirationSide/InspirationSideComp";
import { IoMenu, IoSettingsSharp } from "react-icons/io5";
import UseInspirationStore from "../../states/UseInspirationStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UseSidebarStore from "../../states/UseSidebarStore";
import InspirationNav from "../Inspiration/InspirationNav/InspirationNav";
import PhotographerNav from "../Photographer/PhotographerList/PhotographerNav";
import SellingPhotoNav from "../SellingPhoto/SellingPhotoNav";
import UserApi from "../../apis/UserApi";
import { useQuery } from "@tanstack/react-query";
import { IoIosArrowUp } from "react-icons/io";
import CameraNav from "../ComCamera/CameraNav";
import PhotoshootPackageNav from "../Booking/PhotoshootPackageNav";
import { RiLogoutBoxLine } from "react-icons/ri";
import { Skeleton } from "antd";
import "./Explore.css";
const Explore = () => {
  const navigate = useNavigate();
  const { activeTitle, activeIcon, activeQuote, activeItem } =
    UseInspirationStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isPhotographer, setIsPhotographer] = useState(false);
  const { keycloak } = useKeycloak();

  const user = UserService.getTokenParsed();

  useEffect(() => {
    const roles = user?.resource_access?.purepixel?.roles || [];
    if (
      roles.some((role) => role === "purepixel-admin" || role === "manager")
    ) {
      navigate("/admin");
    }
  }, [user, navigate]);
  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () =>
    keycloak.logout({
      redirectUri: "https://purepixel.io.vn",
    });

  const isInspirationActive = activeItem === 1;
  const isPhotographerListActive = activeItem === 4;
  const isSellingListActive = activeItem === 6;
  const isCameraActive = activeItem === 5;
  const isPhotoshootPackActive = activeItem === 8;

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const role = user?.resource_access?.purepixel?.roles;

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

  useEffect(() => {
    if (role?.includes("photographer")) setIsPhotographer(true);
  }, [data]);
  return (
    <div className="flex flex-grow h-screen ">
      <div className="flex w-full">
        <div
          className={`flex flex-col bg-[#2f3136] transition-all duration-200 lg:w-72 ${
            isSidebarOpen ? "w-60" : "w-0 overflow-hidden"
          } lg:overflow-visible absolute lg:relative z-20 h-screen`}
        >
          {/* <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]"> */}
          <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
            <InspirationSideComp />
          </div>
          <div className="sticky bottom-0 bg-[#2a2d31] p-[12.5px]">
            {isLoading && user ? (
              <div className="flex flex-row gap-2">
                <Skeleton.Button
                  active={true}
                  shape={"circle"}
                  className="custom-skeleton-button"
                />
                <Skeleton.Input
                  active={true}
                  size={"small"}
                  className="custom-skeleton-input"
                />
              </div>
            ) : data ? (
              <div className="flex items-center justify-between gap-2 ">
                <div
                  onClick={() => navigate("/profile")}
                  className="relative flex items-center gap-2 hover:cursor-pointer hover:bg-[#36393f] py-[5px] px-[5px] rounded-md"
                >
                  <div className=" w-[34px] h-[34px] overflow-hidden rounded-full ">
                    <img
                      src={`${data?.avatar}`}
                      alt="avatar"
                      className="w-full h-full object-cover bg-[#eee]"
                    />
                  </div>
                  <div className="text-[13px] truncate max-w-[150px] ">
                    {data?.name}
                  </div>
                  {isPhotographer && (
                    <div className="absolute -bottom-1 left-5 text-[10px] px-1   bg-yellow-500 rounded-lg  text-[#202225]">
                      PRO
                    </div>
                  )}
                </div>
                <div
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="hover:cursor-pointer hover:bg-red-500 transition duration-200  p-[5px] rounded-md"
                >
                  <RiLogoutBoxLine className="size-7" />
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
       ${
         isSidebarOpen
           ? `overflow-hidden `
           : `overflow-y-scroll custom-scrollbar `
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
              {isCameraActive && (
                <CameraNav activeTitle={activeTitle} activeIcon={activeIcon} />
              )}
              {isPhotoshootPackActive && (
                <PhotoshootPackageNav
                  activeTitle={activeTitle}
                  activeIcon={activeIcon}
                />
              )}
            </div>
            <Outlet />
            {isVisible && !isSidebarOpen && (
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
