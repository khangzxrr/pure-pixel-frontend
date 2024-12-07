import React from "react";
import LoadingSpinnerPage from "./LoadingSpinnerPage";

const LoadingPage = () => {
  return (
    <div className="relative h-screen bg-[#43474e] flex flex-col items-center justify-center">
      <div className="size-14 animate-pulse overflow-hidden">
        <img src="./purepixel.png" alt="" className="size-full object-cover" />
      </div>
      <div className="absolute">
        <LoadingSpinnerPage />
      </div>
    </div>
  );
};

export default LoadingPage;
