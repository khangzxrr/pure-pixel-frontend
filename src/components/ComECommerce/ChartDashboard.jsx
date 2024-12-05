import React from "react";
import ChartDashboardUpgradePackage from "./ChartDashboardUpgradePackage";
import ChartDashboardRevenue from "./ChartDashboardRevenue";

const ChartDashboard = () => {
  return (
    <div className="px-5 grid lg:grid-cols-6 grid-cols-1 gap-8">
      <div className="col-span-4 bg-[#32353b]  rounded-sm">
        <ChartDashboardUpgradePackage />
      </div>
      <div className="col-span-2 bg-[#32353b]  rounded-sm">
        <ChartDashboardRevenue />
      </div>
    </div>
  );
};

export default ChartDashboard;
