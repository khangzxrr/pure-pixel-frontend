import React from "react";
import { Skeleton } from "antd";
import SkeletonImage from "../UI/Skeleton/SkeletonImage";

const LoadingProfile = () => {
  return (
    <div className="flex flex-col items-center justify-center p-5  text-center">
      <div className="w-full z-10 -mb-12">
        <SkeletonImage />
      </div>
      {/* Circular Skeleton for Profile Image */}
      <Skeleton.Avatar active size={120} shape="circle" className="mb-4 z-20" />

      {/* Skeleton for Text */}
      <Skeleton active paragraph={{ rows: 2 }} className="mb-4 z-20" />

      {/* Contact Text Skeleton */}
      <Skeleton active paragraph={{ rows: 1 }} className="mb-4 z-20" />

      {/* Social Media Buttons Skeleton */}
      <div className="flex space-x-4 z-20">
        <Skeleton.Button active size="default" className="w-24" />
        <Skeleton.Button active size="default" className="w-24" />
        <Skeleton.Button active size="default" className="w-24" />
        <Skeleton.Button active size="default" className="w-24" />
      </div>
    </div>
  );
};

export default LoadingProfile;
