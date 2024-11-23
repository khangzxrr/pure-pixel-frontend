import React, { useEffect } from "react";
import TotalCards from "./TotalCards";
import TotalMoneyUpgrade from "../../components/ComAdmin/TotalMoneyUpgrade";
import BarChart from "../../components/ComAdmin/BarChart";
import TopPhotoSelling from "../../components/ComAdmin/TopPhotoSelling";
import AdminApi from "../../apis/AdminApi";
import { useQuery } from "@tanstack/react-query";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";

const StatiticsPage = () => {
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      AdminApi.getDashboard(fromDate.toISOString(), toDate.toISOString()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const dataDashboard = data;
  const lastDataDashboard = dataDashboard[dataDashboard.length - 1];

  const listRevenuePackage = dataDashboard?.map(
    (item) => item.data.revenueFromUpgradePackage
  );

  const dateList = dataDashboard?.map((item) => item.createdAt);
  const userTotalByDateList = dataDashboard?.map((item) => item.data.userTotal);
  const photoTotalByDateList = dataDashboard?.map(
    (item) => item.data.totalPhoto
  );
  console.log(photoTotalByDateList);

  const listRevenuePhotoSelling = dataDashboard?.map(
    (item) => item.data.revenueFromSellingPhoto
  );

  const formattedDates = dateList?.map((dateStr) => {
    const date = new Date(dateStr); // Chuyển chuỗi ngày thành đối tượng Date

    // Lấy ngày và tháng và đảm bảo 2 chữ số
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    return `${day}/${month}`; // Trả về định dạng dd/mm
  });

  return (
    <div className="flex flex-col gap-3 p-2 ">
      <TotalCards dataDashboard={dataDashboard} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TotalMoneyUpgrade
          nameChart={"Thống kê số tiền gói nâng cấp"}
          labelArray={formattedDates}
          dataArray={listRevenuePackage}
        />
        <TotalMoneyUpgrade
          nameChart={"Thống kê số tiền hoa hồng từ bán ảnh"}
          labelArray={formattedDates}
          dataArray={listRevenuePhotoSelling}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BarChart
          nameChart={"Thống kê số lượng người dùng"}
          labelArray={formattedDates}
          dataArray={userTotalByDateList}
        />
        <TotalMoneyUpgrade
          nameChart={"Thống kê số lượng ảnh"}
          labelArray={formattedDates}
          dataArray={photoTotalByDateList}
        />
      </div>
      <div className="flex flex-col p-3 bg-[#eee] rounded-md">
        <TopPhotoSelling dataLastDays={lastDataDashboard} />
      </div>
    </div>
  );
};

export default StatiticsPage;
