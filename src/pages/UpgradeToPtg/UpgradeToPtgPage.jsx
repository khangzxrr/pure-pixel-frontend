import React from "react";
import UpgradeToPtgLayout from "./../../layouts/UpgradeToPtgLayout";

const UpgradeToPtgPage = () => {
  return (
    <div className="relative min-h-screen bg-[url('https://picsum.photos/3840/2160')] bg-cover bg-center">
      {/* Black overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Main content */}
      <div className="relative">
        <UpgradeToPtgLayout />
      </div>
    </div>
  );
};

export default UpgradeToPtgPage;
