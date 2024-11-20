import React from "react";
import UploadSide from "./UploadSide";
import { Outlet, useNavigate } from "react-router-dom";
import { IoMenu, IoSettingsSharp } from "react-icons/io5";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UseUploadStore from "../../states/UseUploadStore";
import UseInspirationStore from "../../states/UseInspirationStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import SidebarLayout from "../../layouts/SidebarLayout";
const Upload = () => {
  const navigate = useNavigate();
  const { activeTitle, activeIcon, activeQuote } = UseUploadStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <SidebarLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      userData={userData}
      activeIcon={activeIcon}
      activeTitle={activeTitle}
      activeQuote={activeQuote}
      sidebarContent={<UploadSide />}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default Upload;
