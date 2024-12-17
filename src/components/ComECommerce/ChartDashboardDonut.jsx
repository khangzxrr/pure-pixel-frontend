import React from "react";
import ChartDashboardRevenue from "./ChartDashboardRevenue";

const ChartDashboardDonut = ({ dashBoardData }) => {
  const revenueFromSellingPhoto = dashBoardData?.revenueFromSellingPhoto;
  const revenueFromUpgradePackage = dashBoardData?.revenueFromUpgradePackage;
  return (
    <div className="px-5 grid lg:grid-cols-2 grid-cols-1 gap-8">
      <div className="col-span-1 bg-[#32353b]  py-2 rounded-sm"></div>
      <div className="col-span-1 bg-[#32353b]  py-2 rounded-sm">
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

export default ChartDashboardDonut;
