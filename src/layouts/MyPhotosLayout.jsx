import React from "react";
import PhotoProfile from "../components/PhotoProfile/PhotoProfile";
import MyPhotoP from "../components/PhotoProfile/MyPhotoP";
import UserService from "../services/Keycloak";
const MyPhotosLayout = () => {
  const userData = UserService.getTokenParsed();
  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="p-[24px] h-[177px] bg-[#292b2f]">
        <PhotoProfile userData={userData} />
      </div>
      <div>
        <MyPhotoP />
      </div>
    </div>
  );
};

export default MyPhotosLayout;
