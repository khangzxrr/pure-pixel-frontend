import React, { useEffect, useState } from "react";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UserProfileSideBar from "./UserProfileSideBar";
import { IoPersonSharp } from "react-icons/io5";
import { IoMdPhotos } from "react-icons/io";
import {
  FaWallet,
  FaImages,
  FaCameraRetro,
  FaClipboardList,
} from "react-icons/fa";
import { BiMoneyWithdraw } from "react-icons/bi";
import { MdOutlinePhotoFilter } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import UserApi from "../../apis/UserApi";
import { FaBookmark } from "react-icons/fa6";

const UserProfileSideItems = [
  {
    id: "NameProfile",
    title: "Hồ sơ",
    icon: <IoPersonSharp />,
    link: "/profile/userprofile",
  },
  {
    id: "MyPhotos",
    title: "Ảnh của tôi",
    icon: <IoMdPhotos />, // Icon ảnh
    link: "/profile/my-photos",
  },
  {
    id: "MyPhotosSelling",
    title: "Ảnh đã mua",
    icon: <BiMoneyWithdraw />, // Icon ảnh
    link: "/profile/photos-bought",
  },
  // {
  //   id: "MyBookmark",
  //   title: "Ảnh đã đánh dấu",
  //   icon: <FaBookmark />,
  //   link: "/profile/bookmark", // Icon ảnh
  // },
  {
    id: "photo",
    link: "/profile/photo-selling",
    title: "Cửa hàng của tôi",
    author: true,
    icon: <FaImages className="text-3xl" />, // Icon ảnh bán
  },
  {
    id: "transaction",
    link: "/profile/wallet",
    title: "Ví",
    icon: <FaWallet className="text-3xl" />, // Icon ví
  },
  {
    id: "booking",
    link: "/profile/photoshoot-package",
    title: "Quản lý gói chụp",
    author: true,
    icon: <FaCameraRetro className="text-3xl" />, // Icon máy ảnh
  },
  {
    id: "booking-request",
    link: "/profile/booking-request",
    title: "Yêu cầu chụp của khách",
    author: true,

    icon: <FaClipboardList className="text-3xl" />, // Icon quản lý yêu cầu
  },
  {
    id: "customer-booking",
    link: "/profile/customer-booking",
    title: "Yêu cầu chụp của tôi",
    icon: <MdOutlinePhotoFilter className="text-3xl" />, // Icon quản lý yêu cầu
  },
];

const UseProfileSide = () => {
  const { activeItem, setActiveItem } = UseUserProfileStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const roles = userData?.resource_access?.purepixel?.roles;
  const [isPhotographer, setIsPhotographer] = useState(false);

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () =>
    keycloak.logout({
      redirectUri: "https://purepixel.io.vn",
    });
  // Kiểm tra nếu người dùng có vai trò "photographer"
  // const isPhotographer = roles?.includes("photographer");
  // Lọc các item theo vai trò của người dùng
  useEffect(() => {
    if (roles?.includes("photographer")) {
      setIsPhotographer(true);
    }
  }, [roles]);

  const filteredSideItems = UserProfileSideItems.filter(
    (item) => isPhotographer || !item.author,
  );
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const handleClick = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);
  return (
    <UserProfileSideBar
      sideItems={filteredSideItems}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={data}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default UseProfileSide;
