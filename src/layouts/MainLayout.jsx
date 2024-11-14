import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import React from "react";
import UserService from "../services/Keycloak";
const MainLayout = () => {
  const userDataKeyCloak = UserService.getTokenParsed();

  const role = userDataKeyCloak?.resource_access?.purepixel?.roles;
  console.log("AppRouter", role, userDataKeyCloak);
  return (
    <>
      <div className="bg-[#f7f8fa]">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
