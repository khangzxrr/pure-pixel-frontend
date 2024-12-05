import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ServerSide from "../components/ServerSide/ServerSide";
import UseSidebarStore from "../states/UseSidebarStore";
import NotificationModal from "./../components/ComNotificate/NotificationModal";
import UseNotificationStore from "../states/UseNotificationStore";

const DashboardLayoutF = () => {
  const { isSidebarOpen, setIsSidebarOpen } = UseSidebarStore(); // Lấy setIsSidebarOpen
  const { isNotificationOpen, closeNotificationModal } = UseNotificationStore();
  // const role = userData?.resource_access.purepixel.roles;

  // useEffect(() => {
  //   if (role?.includes("purepixel-admin")) {
  //     navigate("/admin");
  //   }
  // }, [role]);

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
      <div className="relative w-full h-screen overflow-hidden  ">
        <Outlet />
        <div className="">
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
