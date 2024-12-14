import React, { useEffect } from "react";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UserOtherSidebar from "./UserOtherSidebar";
import { useParams } from "react-router-dom";
import { IoPersonSharp } from "react-icons/io5";
import { FaCameraRetro, FaMoneyBillWave } from "react-icons/fa6";

const UserOtherSide = () => {
  const { setUserOtherId, activeItem, setActiveItem, userOtherId } =
    UseUserOtherStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const { userId } = useParams();

  // console.log(userOtherId);

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () =>
    keycloak.logout({
      redirectUri: "https://purepixel.io.vn",
    });
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
      link: `/user/${userOtherId}/photos`,
    },
    {
      id: "UO3",
      title: "Các gói dịch vụ",
      icon: <FaCameraRetro />,
      link: `/user/${userOtherId}/packages`,
    },
    {
      id: "UO4",
      title: "Các ảnh đang bán",
      icon: <FaMoneyBillWave />,
      link: `/user/${userOtherId}/selling`,
    },
  ];
  useEffect(() => {
    // console.log("userId", userId, userOtherId);
    if (userId !== undefined) {
      setActiveItem(
        "UO2",
        "Hồ sơ",
        <IoPersonSharp />,
        `/user/${userId}/photos`
      );
      setUserOtherId(userId);
    }
  }, [userId]);
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
