import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const SideBar = ({ sideItems, trendItems, handleClick, activeItem }) => {
  return (
    <div>
      <Sidebar
        sideItems={sideItems}
        trendItems={trendItems}
        handleClick={handleClick}
        activeItem={activeItem}
        isImg={true}
        isUpload={false}
      />
    </div>
  );
};

export default SideBar;
