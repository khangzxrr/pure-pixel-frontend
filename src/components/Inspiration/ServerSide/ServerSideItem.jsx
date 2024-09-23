import React from "react";
import { Link } from "react-router-dom";
import UseExplorerStore from "../../../states/UseExplorerStore";

const ServerSideItem = ({ id, link, icon }) => {
  const { activeItem, setActiveItem } = UseExplorerStore();

  const handleClick = () => {
    setActiveItem(id);
    console.log(id);
  };
  return (
    <Link
      to={link}
      onClick={handleClick}
      className={`flex items-center justify-center w-12 h-12 hover:cursor-pointer hover:bg-gray-500 p-2 rounded-md transition-colors duration-200
        ${activeItem === id ? "bg-gray-500" : ""}`}
    >
      {icon}
    </Link>
  );
};

export default ServerSideItem;
