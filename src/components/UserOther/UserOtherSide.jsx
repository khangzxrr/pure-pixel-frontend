import React from "react";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UserOtherSidebar from "./UserOtherSidebar";
import { useParams } from "react-router-dom";
import { IoPersonSharp } from "react-icons/io5";
import { FaImages } from "react-icons/fa6";

const UserOtherSide = () => {
  const { activeItem, setActiveItem } = UseUserOtherStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const params = useParams();
  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();
  const handleClick = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);
  const UserOtherItem = [
    {
      id: "UO1",
      title: "Hồ sơ",
      icon: <IoPersonSharp />,
      link: `/user/${params.id}`,
    },
    {
      id: "UO2",
      title: "Ảnh",
      icon: <FaImages />,
      link: `/user/${params.id}/photos`,
    },
  ];
  return (
    <UserOtherSidebar
      sideItems={UserOtherItem}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={userData}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default UserOtherSide;
