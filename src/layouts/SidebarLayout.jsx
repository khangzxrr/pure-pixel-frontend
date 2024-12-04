import React, { useEffect, useState } from "react";
import { IoMenu } from "react-icons/io5";
import { IoIosArrowUp, IoIosCamera } from "react-icons/io";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserApi from "../apis/UserApi";
import UseCameraStore from "../states/UseCameraStore";
import { RiLogoutBoxLine } from "react-icons/ri";
import UserService from "../services/Keycloak";

const SidebarLayout = ({
  isSidebarOpen,
  toggleSidebar,
  userData,
  activeIcon,
  activeTitle,
  sidebarContent,
  onLogout,
  onLogin,
  onRegister,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isPhotographer, setIsPhotographer] = useState(false);

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const role = userData?.resource_access?.purepixel?.roles;
  const isUploadRoute = location.pathname === "/upload/public" ? true : false;

  const brandCamera = UseCameraStore((state) => state.brandCamera);
  const setNameCamera = UseCameraStore((state) => state.setNameCamera);

  useEffect(() => {
    if (location.pathname.includes("/camera/all")) {
      setNameCamera("", "");
    }
  }, [location.pathname, setNameCamera]);
  useEffect(() => {
    if (role?.includes("photographer")) setIsPhotographer(true);
  }, [data]);
  // Xử lý hiển thị nút cuộn lên đầu
  const handleScroll = () => {
    const scrollTop = document.getElementById("main").scrollTop;
    setIsVisible(scrollTop > 300);
  };

  const scrollToTop = () => {
    document.getElementById("main").scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const mainDiv = document.getElementById("main");
    mainDiv.addEventListener("scroll", handleScroll);
    return () => {
      mainDiv.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-grow max-h-screen relative">
      <div className="flex w-full">
        {/* left sidebar */}
        <div
          className={`flex flex-col bg-[#2f3136] transition-all duration-200 lg:w-72 ${
            isSidebarOpen ? "w-60" : "w-0 overflow-hidden"
          } lg:overflow-visible  absolute lg:relative z-30 h-screen`}
        >
          <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar scrollbar-width:thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
            {sidebarContent}
          </div>
          <div className="sticky bottom-0 bg-[#2a2d31] p-[12.5px]">
            {/* Nội dung user profile hoặc nút đăng nhập/đăng ký */}
            {userData ? (
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={() => (
                    navigate("/profile/userprofile"), setNameCamera("", "")
                  )}
                  className="relative flex items-center gap-2 hover:cursor-pointer hover:bg-[#36393f] py-[5px] px-[5px] rounded-md transition-colors duration-300"
                >
                  <div className="w-[34px] h-[34px] overflow-hidden rounded-full">
                    <img
                      src={data?.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover bg-[#eee]"
                    />
                  </div>
                  <div className="text-[13px] truncate max-w-[150px] ">
                    {data?.name}
                  </div>
                  {isPhotographer && (
                    <div className="absolute -bottom-[2px] left-6 text-[10px] p-[2px]   bg-yellow-500 rounded-full  text-[#202225]">
                      <IoIosCamera className="text-[14px]" />
                    </div>
                  )}
                </div>
                <div
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="hover:cursor-pointer hover:bg-red-500 transition duration-200  p-[5px] rounded-md"
                >
                  <RiLogoutBoxLine className="size-7" />
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

        {/* content */}
        <div
          id="main"
          className={`flex flex-col flex-grow h-full relative lg:overflow-y-auto scrollbar scrollbar-width: thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f] ${
            isSidebarOpen
              ? `overflow-y-hidden`
              : `overflow-y-auto custom-scrollbar`
          }`}
        >
          <div className="sticky top-0 px-2 z-20 flex justify-between items-center bg-[#36393f] bg-opacity-80 backdrop-blur-md h-[52px] py-3  w-full">
            <div className="flex items-center space-x-4">
              <div className="hover:bg-[#4e535e] p-1 rounded-full transition-colors duration-200">
                <IoMenu
                  size={24}
                  className="lg:hidden hover:cursor-pointer "
                  onClick={toggleSidebar}
                />{" "}
              </div>
              <div className="flex gap-2 items-center lg:items-end">
                <div className="flex items-center gap-2 pr-4 border-r-[1px] border-[#777777]">
                  <div className="text-2xl">{activeIcon}</div>
                  {/* fix sidebar layout */}
                  <div className="hidden 2xl:block">{activeTitle}</div>
                </div>
              </div>
            </div>
            {isSidebarOpen && (
              <div
                className="absolute  inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                onClick={toggleSidebar}
              ></div>
            )}
          </div>
          <div className="min-h-screen">
            <Outlet />
          </div>
          {/* Nút cuộn lên đầu trang */}
          {isVisible && !isSidebarOpen && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-5 right-10 z-20 bg-[#4e535e] border-2 hover:bg-[#777777] text-white p-2 rounded-full transition-colors duration-200"
            >
              <IoIosArrowUp size={24} />
            </button>
          )}

          {/* Overlay for blocking interactions */}
          {isSidebarOpen && (
            <div
              className="absolute  inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
              style={{ height: "9999px" }}
              onClick={toggleSidebar}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
