import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const Upload = ({ sideItems, trendItems, handleClick, activeItem }) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isUpload={true}
    />
  );
};

export default Upload;
