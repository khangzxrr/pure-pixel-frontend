import React from "react";
import InfoComponent from "../components/ProfileDetail/InfoComponent/InfoComponent";
import PhotoProfileComponent from "../components/ProfileDetail/PhotoProfileComponent/PhotoProfileComponent";

const ProfileDetailLayout = () => {
  return (
    <div className="flex flex-col gap-3">
      <InfoComponent />
      <PhotoProfileComponent />
    </div>
  );
};

export default ProfileDetailLayout;
