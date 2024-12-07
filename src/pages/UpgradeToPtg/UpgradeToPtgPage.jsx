import React from "react";
import UpgradeToPtgLayout from "./../../layouts/UpgradeToPtgLayout";

const UpgradeToPtgPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* Black overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Main content */}
      <div className="relative custom-scrollbar max-h-screen">
        <UpgradeToPtgLayout />
      </div>
    </div>
  );
};

export default UpgradeToPtgPage;
