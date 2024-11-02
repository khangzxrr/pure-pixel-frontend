import React from "react";
import CameraCard from "./CameraCard";
import CameraChart from "./CameraChart";
import CameraTableList from "./CameraTableList";
import CameraPopularBrand from "./CameraPopularBrand";

const CameraList = () => {
  return (
    <div className="flex flex-col  gap-5 p-4">
      <div>
        <CameraPopularBrand />
      </div>
      <div className="flex justify-center">
        <CameraChart />
      </div>
      <div className="">
        <CameraTableList />
      </div>
    </div>
  );
};

export default CameraList;
