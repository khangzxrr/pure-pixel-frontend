// User.js
import React from "react";
import UseSidebarStore from "../../states/UseSidebarStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UseUserProfileStore from "./../../states/UseUserProfileStore";
import UseProfileSide from "./UseProfileSide";
import SidebarLayout from "../../layouts/SidebarLayout";
import { useNavigate } from "react-router-dom";

const User = () => {
  const navigate = useNavigate();
  const { activeTitle, activeIcon, activeQuote } = UseUserProfileStore();
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
      sidebarContent={<UseProfileSide />}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default User;
