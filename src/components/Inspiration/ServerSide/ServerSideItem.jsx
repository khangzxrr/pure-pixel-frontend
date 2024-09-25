import React from "react";
import { Link } from "react-router-dom";
import UseSidebarStore from "../../../states/UseSidebarStore";

const ServerSideItem = ({ id, link, icon }) => {
  const { activeLink, setActiveLink } = UseSidebarStore();

  const handleClick = () => {
    setActiveLink(link); // Lưu vị trí link
  };

  return (
    <Link
      to={link}
      onClick={handleClick}
      className={`flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200
        ${activeLink === link ? "bg-gray-500" : ""}`} // Kiểm tra nếu link đang hoạt động
    >
      {icon}
    </Link>
  );
};

export default ServerSideItem;
