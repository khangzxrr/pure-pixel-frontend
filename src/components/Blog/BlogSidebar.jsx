import React from "react";
import Sidebar from "../Sidebar/Sidebar";

const BlogSidebar = ({ sideItems, trendItems, handleClick, activeItem }) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isImg={false}
      isUpload={false}
      isBlog={true}
    />
  );
};

export default BlogSidebar;
