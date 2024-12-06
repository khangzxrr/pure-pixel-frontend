import React from "react";
import { useParams } from "react-router-dom";
import ChartDashboardUpgradePackage from "./ChartDashboardUpgradePackage";
import TablePhotographersList from "./TablePhotographersList";
import TablePhotoListOfPhotographer from "./TablePhotoListOfPhotographer";
import ChartRevenueOfPhotographer from "./ChartRevenueOfPhotographer";
import CardDataStats from "./CardDataStats";
import { MdAttachMoney } from "react-icons/md";
import ChartTotalPhotoSoldByDay from "./ChartTotalPhotoSoldByDay";
import TablePhotoshootOfPhotographer from "./TablePhotoshootOfPhotographer";

const PhotographerDetailStats = () => {
  const { photographerId } = useParams();

  return (
    <div className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4">
      <div className="col-span-2 flex flex-col gap-4">
        <div className="bg-[#32353b]  rounded-sm  flex flex-col items-center gap-2 p-4 text-[#eee]">
          <div className="size-32 overflow-hidden rounded-full">
            <img src="" alt="" className="bg-[#eee] size-full object-cover" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="font-semibold">Nguyen thanh Trung</div>
            <div className="text-sm">Ho Chi Minh</div>
            <div className="text-sm">Email: 5X0Y2@example.com</div>
            <div className="text-sm">Số điện thoại: 0123456789</div>
            <div className="text-sm">Ngày tạo: 12/12/2022</div>
          </div>
        </div>
        <CardDataStats
          icon={<MdAttachMoney className="text-xl" />}
          dataCount={"20,000,000 VNĐ"}
          label={"Tổng doanh thu"}
          //   percent={"50.7"}
          //   iconPercent={<FaArrowUp />}
          //   colorPercent={"text-green-500"}
          //   onClick={handleRevenueTotalModal}
        />
        <div className="bg-[#32353b]  rounded-sm">
          <ChartRevenueOfPhotographer />
        </div>
      </div>
      <div className="col-span-6 flex flex-col gap-4 ">
        <div className="bg-[#32353b]  rounded-sm">
          <ChartTotalPhotoSoldByDay />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#32353b]  rounded-sm col-span-3">
            <TablePhotoListOfPhotographer />
          </div>
          {/* <div className="">
            <div className="bg-[#32353b]  rounded-sm">
              <ChartRevenueOfPhotographer />
            </div>
          </div> */}
        </div>
        <div className="bg-[#32353b] rounded-sm">
          <TablePhotoshootOfPhotographer />
        </div>
      </div>
    </div>
  );
};

export default PhotographerDetailStats;
