import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import UserService from "../../services/Keycloak";
import SideBar from "../Explore/SideBar";
import UploadSideItem from "./UploadSideItem";
import UseUploadStore from "../../states/UseUploadStore";
import UploadSidebar from "./UploadSidebar";

const UploadSide = () => {
  const { activeItem, setActiveItem } = UseUploadStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();

  const handleLogout = () =>
    keycloak.logout({
      redirectUri: "https://purepixel.io.vn",
    });
  const handleClick = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);
  return (
    <UploadSidebar
      sideItems={UploadSideItem}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={userData}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default UploadSide;
