import React from "react";
import UserProfileSideItems from "./UserProfileSideItems";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UserProfileSideBar from "./UserProfileSideBar";

const UseProfileSide = () => {
  const { activeItem, setActiveItem } = UseUserProfileStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();
  const handleClick = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);
  return (
    <UserProfileSideBar
      sideItems={UserProfileSideItems}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={userData}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default UseProfileSide;
