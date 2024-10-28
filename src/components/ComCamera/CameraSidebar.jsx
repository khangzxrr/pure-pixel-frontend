import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const CameraSidebar = ({ sideItems, trendItems, handleClick, activeItem }) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isCamera={true}
    />
  );
};

export default CameraSidebar;
