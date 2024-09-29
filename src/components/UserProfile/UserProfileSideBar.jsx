import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const UserProfileSideBar = ({
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
      isImg={false}
      isUpload={false}
      isUser={true}
    />
  );
};

export default UserProfileSideBar;
