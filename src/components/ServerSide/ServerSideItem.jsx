import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UseServerSideStore from "../../states/UseServerSideStore";

const ServerSideItem = ({
  id,
  link,
  icon,
  isNotification,
  onNotificationClick,
  name,
}) => {
  const location = useLocation();
  const { activeLinkServer, setActiveLinkServer } = UseServerSideStore();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cập nhật activeLinkServer với location.pathname
    setActiveLinkServer(location.pathname);
  }, [location.pathname, setActiveLinkServer]);

  const handleClick = () => {
    setActiveLinkServer(link);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (isNotification) {
    return (
      <div
        onClick={onNotificationClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200"
      >
        {icon}
        {isHovered && (
          <div className="absolute left-full ml-2 whitespace-nowrap bg-gray-700 text-white text-sm p-1 rounded-md shadow-lg z-50">
            {name}
          </div>
        )}
      </div>
    );
  }

  const isActive = location.pathname.startsWith(link);

  return (
    <Link
      to={link}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200
        ${isActive ? "bg-gray-500" : ""}`}
    >
      {icon}
      {isHovered && (
        <div className="absolute left-full ml-2 whitespace-nowrap bg-gray-700 text-white text-sm p-1 rounded-md shadow-lg z-9999">
          {name}
        </div>
      )}
    </Link>
  );
};

export default ServerSideItem;
