import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ServerSide from "../components/ServerSide/ServerSide";
import UseSidebarStore from "../states/UseSidebarStore";
import NotificationModal from "./../components/ComNotificate/NotificationModal";
import UseNotificationStore from "../states/UseNotificationStore";

const DashboardLayoutF = () => {
  const { keycloak } = useKeycloak();
  const { isSidebarOpen, toggleSidebar, setIsSidebarOpen } = UseSidebarStore(); // Lấy setIsSidebarOpen
  const { isNotificationOpen, closeNotificationModal } = UseNotificationStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // Gọi ngay lập tức và thêm event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Dọn dẹp sự kiện khi component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, setIsSidebarOpen]); // Thêm dependencies

  return (
    <div className="relative flex bg-[#43474e] text-white font-semibold h-screen">
      {/* Sidebar cho màn hình lớn */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } lg:flex flex-col w-[70px] px-2 bg-[#202225] h-screen sticky top-0 z-10 inset-0`}
      >
        <ServerSide />
      </div>

      {/* Main content */}
      <div className="flex flex-grow h-screen w-full relative overflow-y-auto overflow-x-hidden z-10 scrollbar scrollbar-width: thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f]">
        <Outlet />
        <div className="h-full">
          <NotificationModal
            isOpen={isNotificationOpen}
            onClose={closeNotificationModal}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutF;
