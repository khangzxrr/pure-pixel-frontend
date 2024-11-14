import React from "react";
import Sidebar from "../Sidebar/Sidebar";
const UserProfileSideBar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
  userData,
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
      nameUser={userData?.name}
    />
  );
};

export default UserProfileSideBar;
