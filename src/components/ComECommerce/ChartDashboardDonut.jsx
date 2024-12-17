import React from "react";
import ChartDashboardRevenue from "./ChartDashboardRevenue";

const ChartDashboardDonut = ({ dashBoardData }) => {
  const revenueFromSellingPhoto = dashBoardData?.revenueFromSellingPhoto;
  const revenueFromUpgradePackage = dashBoardData?.revenueFromUpgradePackage;
  console.log(dashBoardData);

  const totalSize = dashBoardData?.totalSize;
  const totalPhotoSize = dashBoardData?.totalPhotoSize;
  const totalBookingSize = dashBoardData?.totalBookingSize;
  return (
    <div className="px-5 grid lg:grid-cols-2 grid-cols-1 gap-8">
      <div className="col-span-1 bg-[#32353b]  py-2 rounded-sm">
        <ChartDashboardRevenue
          nameChart={"Thống kê tổng dung lượng đã sử dụng"}
          nameParam1={"Dung lượng ảnh"}
          nameParam2={"Dung lượng của gói dịch vụ"}
          param1={totalBookingSize}
          param2={totalPhotoSize}
          total={totalSize}
          isPhoto={true}
        />
      </div>
      <div className="col-span-1 bg-[#32353b]  py-2 rounded-sm">
        <ChartDashboardRevenue
          nameChart={"Thống kê tổng doanh thu"}
          nameParam1={"Hoa hồng bán ảnh"}
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
