import React from "react";
import { Link } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import UseServerSideStore from "../../states/UseServerSideStore";

const ServerSideItem = ({ id, link, icon }) => {
  const { keycloak } = useKeycloak();
  const { activeLinkServer, setActiveLinkServer } = UseServerSideStore();

  const handleClick = () => {
    setActiveLinkServer(link); // Lưu vị trí link
  };

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
