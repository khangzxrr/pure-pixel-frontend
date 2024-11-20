import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const SideBar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
  isFilterInspiration,
}) => {
  return (
    <div>
      <Sidebar
        sideItems={sideItems}
        trendItems={trendItems}
        handleClick={handleClick}
        activeItem={activeItem}
        isImg={true}
        isFilterInspiration={isFilterInspiration}
      />
    </div>
  );
};

export default SideBar;
