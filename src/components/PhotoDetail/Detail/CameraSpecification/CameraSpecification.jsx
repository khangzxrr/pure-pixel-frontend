import React from "react";
import { RiCamera3Line, RiCameraLensLine } from "react-icons/ri";
const CameraSpecification = () => {
  return (
    <div className="flex flex-col bg-white p-5 gap-3 shadow-lg rounded-lg">
      <div className="flex items-center gap-3">
        <RiCamera3Line className="text-3xl" />
        <p className="">Fujifirm X3</p>
      </div>
      <div className="flex  gap-3">
        <RiCameraLensLine className="text-3xl" />
        <div className="flex flex-col">
          <p className="">Sony FE 200-600mm F5.6-6.3 G OSS (SEL200600G)</p>
          <p className="">600mm</p>
          <p className="">f/6.3</p>
          <p className="">1/4000s</p>
          <p className="">ISO1250</p>
        </div>
      </div>
    </div>
  );
};

export default CameraSpecification;
