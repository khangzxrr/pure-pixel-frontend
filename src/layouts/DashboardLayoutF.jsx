import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import { Outlet } from "react-router-dom";
import ServerSide from "../components/ServerSide/ServerSide";
import UseSidebarStore from "../states/UseSidebarStore";
import NotificationModal from "./../components/ComNotificate/NotificationModal";
import UseNotificationStore from "../states/UseNotificationStore";
import { IoMenu } from "react-icons/io5"; // Biểu tượng menu

const DashboardLayoutF = () => {
  const { keycloak } = useKeycloak();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore(); // Thêm toggleSidebar để mở/đóng
  const { isNotificationOpen, closeNotificationModal } = UseNotificationStore();

  return (
    <div className="relative flex bg-[#43474e] text-white font-semibold h-screen">
      {/* Sidebar cho màn hình lớn */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } xl:flex flex-col w-[70px] px-2 bg-[#202225] h-screen sticky top-0 z-10`}
      >
        <ServerSide />
      </div>

      {/* Nút mở Sidebar cho màn hình nhỏ */}

      {/* Main content */}
      <div className="flex flex-grow max-h-screen relative overflow-auto">
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
