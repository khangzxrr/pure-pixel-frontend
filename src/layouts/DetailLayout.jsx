import React from "react";
import Information from "./../components/PhotoDetail/Detail/Information/Information";
import LocationDetail from "./../components/PhotoDetail/Detail/Location/LocationDetail";
import CameraSpecification from "../components/PhotoDetail/Detail/CameraSpecification/CameraSpecification";
import Category from "./../components/PhotoDetail/Detail/Category/Category";
import Selling from "./../components/PhotoDetail/Detail/Selling/Selling";
import UserService from "../services/Keycloak";

const DetailLayout = () => {
  const userData = UserService.getTokenParsed();
  console.log("userData: ", userData);
  const roleUser = userData?.resource_access?.purepixel?.roles || [];
  return (
    <div className="col-span-3 bg-gray-300 p-5">
      <div className="flex flex-col gap-5">
        <Information />
        <LocationDetail />
        <CameraSpecification />
        <Category />
        {userData && roleUser.includes("photographer") ? <Selling /> : null}
      </div>
    </div>
  );
};

export default DetailLayout;
