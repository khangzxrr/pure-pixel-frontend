import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
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
