import React from "react";
import CameraCard from "./CameraCard";
import CameraChart from "./CameraChart";
import CameraTableList from "./CameraTableList";
import CameraPopularBrand from "./CameraPopularBrand";

const CameraList = () => {
  return (
    <div className="flex flex-col  gap-2 p-2 px-14 md:px-2  w-full">
      {/* Responsive CameraPopularBrand Section */}
      <div className="w-1/2 md:w-full">
        <CameraPopularBrand />
      </div>
      {/* Responsive CameraChart Section */}
      <div className="w-1/2 md:w-full">
        <CameraChart />
      </div>
      {/* Responsive CameraTableList Section */}
      <div className="w-1/2 md:w-full">
        <CameraTableList />
      </div>
    </div>
  );
};

export default CameraList;
