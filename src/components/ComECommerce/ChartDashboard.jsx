import React from "react";
import ChartDashboardUpgradePackage from "./ChartDashboardUpgradePackage";
import ChartDashboardRevenue from "./ChartDashboardRevenue";

const ChartDashboard = ({ dashBoardData }) => {
  const revenueFromSellingPhoto = dashBoardData?.revenueFromSellingPhoto;
  const revenueFromUpgradePackage = dashBoardData?.revenueFromUpgradePackage;

  return (
    <div className="px-5 grid lg:grid-cols-6 grid-cols-1 gap-8">
      <div className="col-span-4 bg-[#32353b]  rounded-sm">
        <ChartDashboardUpgradePackage dashBoardData={dashBoardData} />
      </div>
      <div className="lg:col-span-2 col-span-4 bg-[#32353b]  rounded-sm">
        <ChartDashboardRevenue
          nameChart={"Thống kê tổng doanh thu"}
          nameParam1={"Doanh thu bán ảnh"}
          nameParam2={"Doanh thu gói nâng cấp"}
          param1={revenueFromSellingPhoto}
          param2={revenueFromUpgradePackage}
          isMoney={true}
          isRevenue={true}
        />
      </div>
    </div>
  );
};

export default ChartDashboard;
