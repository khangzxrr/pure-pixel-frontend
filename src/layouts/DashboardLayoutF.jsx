import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ServerSide from "../components/ServerSide/ServerSide";
import UseSidebarStore from "../states/UseSidebarStore";
import NotificationModal from "./../components/ComNotificate/NotificationModal";
import UseNotificationStore from "../states/UseNotificationStore";

const DashboardLayoutF = () => {
  const { keycloak } = useKeycloak();
  const { isSidebarOpen } = UseSidebarStore();
  const { isNotificationOpen, closeNotificationModal } = UseNotificationStore();
  // // State quản lý modal
  // const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // // Hàm mở modal
  // const openNotificationModal = () => {
  //   setIsNotificationOpen(true);
  // };

  // // Hàm đóng modal
  // const closeNotificationModal = () => {
  //   setIsNotificationOpen(false);
  // };

  return (
    <div className="relative flex bg-[#43474e] text-white font-semibold">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } xl:flex flex-col w-[70px] px-2 bg-[#202225] h-screen sticky top-0 z-40`}
      >
        <ServerSide />
      </div>
      {/* Main content */}
      <div className="flex flex-grow max-h-screen w-[500px] relative">
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
