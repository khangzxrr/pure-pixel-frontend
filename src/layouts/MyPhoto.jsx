import React from "react";
import MyPhotoNav from "./../components/MyPhoto/MyPhotoNav/MyPhotoNav";
import MyPhotoContent from "../components/MyPhoto/MyPhotoComponent/MyPhotoContent";
import { Outlet } from "react-router-dom";

const MyPhoto = () => {
  return (
    <div className="grid grid-cols-12">
      <MyPhotoNav />
      <Outlet />
    </div>
  );
};

export default MyPhoto;
