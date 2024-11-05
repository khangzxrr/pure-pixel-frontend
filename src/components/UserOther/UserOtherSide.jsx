import React from "react";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UserOtherSidebar from "./UserOtherSidebar";
import { useParams } from "react-router-dom";
import { IoPersonSharp } from "react-icons/io5";
import { IoMdPhotos } from "react-icons/io";
import { FaCameraRetro, FaMoneyBillWave } from "react-icons/fa6";

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
    // {
    //   id: "UO1",
    //   title: "Hồ sơ",
    //   icon: <IoPersonSharp />,
    //   link: `/user/${params.id}`,
    // },
    {
      id: "UO2",
      title: "Hồ sơ",
      icon: <IoPersonSharp />,
      link: `/user/${params.id}/photos`,
    },
    {
      id: "UO3",
      title: "Các gói dịch vụ",
      icon: <FaCameraRetro />,
      link: `/user/${params.id}/packages`,
    },
    {
      id: "UO4",
      title: "Các ảnh đang bán",
      icon: <FaMoneyBillWave />,
      link: `/user/${params.id}/selling`,
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
