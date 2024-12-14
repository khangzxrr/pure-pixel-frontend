import React from "react";
import LoadingSpinnerPage from "./LoadingSpinnerPage";

const LoadingPage = () => {
  return (
    <div className="h-screen bg-[#43474e] flex flex-col items-center justify-center">
      <LoadingSpinnerPage />
    </div>
  );
};

export default LoadingPage;
