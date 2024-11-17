import { Outlet } from "react-router-dom";
import React from "react";
const MainLayout = () => {
  return (
    <>
      <div className="bg-[#f7f8fa]">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
