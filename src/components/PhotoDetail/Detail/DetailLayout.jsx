import React from "react";
import LocationDetail from "./Location/LocationDetail";
import Information from "./Information/Information";
import CameraSpecification from "./../Detail/CameraSpecification/CameraSpecification";
import Category from "./Category/Category";
import Selling from "./Selling/Selling";

const DetailLayout = () => {
  return (
    <div className="col-span-3 bg-gray-300 p-5">
      <div className="flex flex-col gap-5">
        <Information />
        <LocationDetail />
        <CameraSpecification />
        <Category />
        <Selling />
      </div>
    </div>
  );
};

export default DetailLayout;
