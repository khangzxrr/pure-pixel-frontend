import React from "react";
import CameraCard from "./CameraCard";
import CameraChart from "./CameraChart";
import CameraTableList from "./CameraTableList";
import CameraPopularBrand from "./CameraPopularBrand";

const CameraList = () => {
  return (
    <div className="flex flex-col p-4 gap-5">
      <div className="flex flex-col gap-5">
        <div>
          <CameraPopularBrand />
        </div>
        <div className="w-full h-full">
          <CameraChart />
        </div>
      </div>
      <div>
        <CameraTableList />
      </div>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <CameraCard />
        <CameraCard />
        <CameraCard />
      </div> */}
    </div>
  );
};

export default CameraList;
