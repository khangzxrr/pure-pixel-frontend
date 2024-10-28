import React from "react";
import { useNavigate } from "react-router-dom";
import UseCameraStore from "../../states/UseCameraStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import SidebarLayout from "./../../layouts/SidebarLayout";
import CameraSide from "./CameraSide";

const Camera = () => {
  const navigate = useNavigate();
  const { activeTitle, activeIcon, activeQuote } = UseCameraStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();

  const handleLogout = () => {
    navigate("/");
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
      sidebarContent={<CameraSide />}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default Camera;
