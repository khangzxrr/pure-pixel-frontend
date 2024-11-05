import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const UserOtherSidebar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
}) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isOtherProfile={true}
    />
  );
};

export default UserOtherSidebar;
