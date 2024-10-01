import React from "react";
import { Link } from "react-router-dom";
import UseServerSideStore from "../../states/UseServerSideStore";

const ServerSideItem = ({
  id,
  link,
  icon,
  isNotification,
  onNotificationClick,
}) => {
  const { activeLinkServer, setActiveLinkServer } = UseServerSideStore();

  const handleClick = () => {
    setActiveLinkServer(link); // Lưu vị trí link nếu có
  };

  // Nếu là notification thì chỉ mở modal
  if (isNotification) {
    return (
      <div
        onClick={onNotificationClick}
        className="flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200"
      >
        {icon}
      </div>
    );
  }

  // Nếu không phải notification thì điều hướng bằng Link
  return (
    <Link
      to={link}
      onClick={handleClick}
      className={`flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200
        ${activeLinkServer === link ? "bg-gray-500" : ""}`} // Kiểm tra nếu link đang hoạt động
    >
      {icon}
    </Link>
  );
};

export default ServerSideItem;
