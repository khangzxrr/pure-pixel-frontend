import React from "react";
import UseCameraStore from "../../states/UseCameraStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import CameraSidebar from "./CameraSidebar";
import CameraSideItems from "./CameraSideItems";

const CameraSide = () => {
  const { activeItem, setActiveItem } = UseCameraStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();
  const handleClick = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);
  return (
    <CameraSidebar
      sideItems={CameraSideItems}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={userData}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default CameraSide;
