import React from "react";
import { Outlet } from "react-router-dom";
import ServerSide from "../components/Inspiration/ServerSide/ServerSide";
import UseInspirationStore from "../states/UseInspirationStore";
import UseUploadStore from "../states/UseUploadStore";
// Import Zustand store

const DashboardLayoutF = () => {
  const { isSidebarOpen, toggleSidebar } = UseInspirationStore();

  return (
    <div className="flex bg-[#43474e] text-white font-semibold">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } xl:flex flex-col w-[76px] px-2 bg-[#202225] h-screen sticky top-0 z-40`}
      >
        <ServerSide />
      </div>
      {/* Main content */}
      <div className="flex flex-grow h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayoutF;
