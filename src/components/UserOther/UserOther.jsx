import React from "react";
import { useNavigate } from "react-router-dom";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import { Sidebar } from "lucide-react";
import SidebarLayout from "../../layouts/SidebarLayout";
import UserOtherSide from "./UserOtherSide";
import UseSidebarStore from "../../states/UseSidebarStore";

const UserOther = () => {
  const navigate = useNavigate();
  const { activeTitle, activeIcon, activeQuote } = UseUserOtherStore();
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
      sidebarContent={<UserOtherSide />}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default UserOther;
