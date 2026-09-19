import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import UseServerSideStore from "../../states/UseServerSideStore";
import UseNotificationStore from "../../states/UseNotificationStore";

type ServerSideItemProps = {
  id?: string;
  link?: string;
  icon: ReactNode;
  isNotification?: boolean;
  onNotificationClick?: () => void;
  name?: string;
  badge?: boolean;
};

const ServerSideItem = ({
  id,
  link,
  icon,
  isNotification,
  onNotificationClick,
  name,
  badge,
}: ServerSideItemProps) => {
  const location = useLocation();
  const { setActiveLinkServer } = UseServerSideStore();
  const [isHovered, setIsHovered] = useState(false);
  const { closeNotificationModal, isNewNotification, setIsNotification } =
    UseNotificationStore();
  useEffect(() => {
    if (location.pathname === link) {
      setActiveLinkServer(link);
    }
  }, [location.pathname, link, setActiveLinkServer]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (isNotification) {
    return (
      <div
        onClick={() => {
          onNotificationClick?.();
          setIsNotification(false);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={name}
        className="relative flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200"
      >
        {icon}
        {isNewNotification && (
          <div className="absolute top-0 right-0 size-3 bg-red-500 rounded-full"></div>
        )}
        {isHovered && name && (
          <div
            className={`absolute left-full ml-[14px] whitespace-nowrap bg-[#202225] text-[#eee] text-sm rounded-md shadow-lg z-50 px-4 py-[6px]
              transition-all duration-300 transform ${
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2"
              }`}
          >
            {name}
          </div>
        )}
      </div>
    );
  }

  // every menu entry except the notification toggle has a link
  if (link === undefined) {
    return null;
  }

  const handleClick = () => {
    setActiveLinkServer(link);
    closeNotificationModal();
  };

  const isActive =
    id !== "logo" && location.pathname.slice(1).startsWith(link.slice(1));

  return (
    <Link
      to={link}
      title={name}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200 ${
        isActive ? "bg-gray-500" : ""
      }`}
    >
      {icon}
      {badge && (
        <div className="absolute top-0 right-0 size-3 bg-red-500 rounded-full"></div>
      )}
      {isHovered && name && (
        <div
          className={`absolute left-full ml-[14px] whitespace-nowrap bg-[#202225] text-[#eee] font-semibold text-sm px-4 py-[6px] rounded-md shadow-lg z-50
            transition-all duration-300 transform ${
              isHovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2"
            }`}
        >
          {name}
        </div>
      )}
    </Link>
  );
};

export default ServerSideItem;
