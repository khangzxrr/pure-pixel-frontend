import React from "react";
import UseBlogStore from "../../states/UseBlogStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import BlogSide from "./BlogSide";
import SidebarLayout from "../../layouts/SidebarLayout";

const Blog = () => {
  const { activeTitle, activeIcon, activeQuote } = UseBlogStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();

  return (
    <SidebarLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      userData={userData}
      activeIcon={activeIcon}
      activeTitle={activeTitle}
      activeQuote={activeQuote}
      sidebarContent={<BlogSide />}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default Blog;
