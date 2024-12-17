import React from "react";
import { useParams } from "react-router-dom";
import ChartDashboardUpgradePackage from "./ChartDashboardUpgradePackage";
import TablePhotographersList from "./TablePhotographersList";
import TablePhotoListOfPhotographer from "./TablePhotoListOfPhotographer";
import ChartRevenueOfPhotographer from "./ChartRevenueOfPhotographer";
import CardDataStats from "./CardDataStats";
import { MdAttachMoney, MdDateRange } from "react-icons/md";
import ChartTotalPhotoSoldByDay from "./ChartTotalPhotoSoldByDay";
import TablePhotoshootOfPhotographer from "./TablePhotoshootOfPhotographer";
import { useQuery } from "@tanstack/react-query";
import AdminApi from "../../apis/AdminApi";
import LoadingOval from "../LoadingSpinner/LoadingOval";
import { FormatDate } from "./../../utils/FormatDate";
import formatPrice from "./../../utils/FormatPriceUtils";
import ChartDashboardRevenue from "./ChartDashboardRevenue";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoMail } from "react-icons/io5";
import UseECommerceStore from "../../states/UseECommerceStore";
import RefreshButton from "../ComButton/RefreshButton";

const PhotographerDetailStats = () => {
  const { photographerId } = useParams();

  const { fromDate, toDate, setFromDateState, setToDateState } =
    UseECommerceStore();

  // const toDate = new Date();
  // const fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fromDateCustomize = "2024-10-01T01:30:14.761+07:00";
  const { data, isLoading, isError, isFetching, error, refetch } = useQuery({
    queryKey: [
      "photographer-detail-dashboard",
      photographerId,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      AdminApi.getSellerByIdDashboard(
        photographerId,
        fromDate.toISOString(),
        toDate.toISOString()
      ),
  });

  const photographerData = data?.user;

  const photoSellRevenue = data?.photoSellRevenue;
  const photoshootPackageRevenue = data?.photoshootPackageRevenue;
  const totalRevenueFormat = formatPrice(
    data?.photoSellRevenue + data?.photoshootPackageRevenue
  );
  const topSoldPhotos = data?.topSoldPhotos;
  const topPhotoshootPackages = data?.topPhotoshootPackages;

  const handleOnRefresh = () => {
    refetch();
  };
  return (
    <>
      <div className="flex items-center gap-2 justify-end mx-4">
        <div className=" text-[#eee]">
          Dữ liệu được thống kê từ ngày {FormatDate(fromDate)} -{" "}
          {FormatDate(toDate)}
        </div>
        <RefreshButton onClick={() => handleOnRefresh()} />
      </div>

      {(isLoading || isFetching) && (
        <div className="flex items-center justify-center h-[200px]">
          <LoadingOval />
        </div>
      )}
      {isError && (
        <div className="flex flex-col text-red-500 items-center justify-center h-[200px]">
          <p>Xảy ra lỗi trong quá trình cập nhật thông tin</p>
          <p>
            {error.message}: {error.response.data.message}
          </p>
        </div>
      )}
      {!isLoading && !isFetching && (
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4">
          <div className="col-span-2 flex flex-col gap-4">
            <div
              className="bg-[#32353b] relative  rounded-sm bg-cover bg-center flex flex-col items-center gap-2 p-4 text-[#eee]"
              style={{ backgroundImage: `url(${photographerData?.cover})` }}
            >
              <div className="absolute inset-0 backdrop-blur-sm bg-black/50 "></div>
              <div className="relative size-32 overflow-hidden rounded-full">
                <img
                  src={photographerData?.avatar}
                  alt=""
                  className="bg-[#eee] size-full object-cover"
                />
              </div>
              <div className="relative flex flex-col items-center gap-1">
                <div className="font-semibold flex justify-center">
                  {photographerData?.name}
                </div>
                {photographerData?.location && (
                  <div className="text-sm flex items-center gap-2">
                    <FaLocationDot /> {photographerData?.location}
                  </div>
                )}
                {photographerData?.mail && (
                  <div className="text-sm flex items-center gap-2">
                    <IoMail /> {photographerData?.mail}
                  </div>
                )}
                {photographerData?.phonenumber && (
                  <div className="text-sm flex items-center gap-2">
                    <FaPhone /> {photographerData?.phonenumber}
                  </div>
                )}

                <div className="text-sm flex items-center gap-2">
                  <MdDateRange /> {FormatDate(photographerData?.createdAt)}
                </div>
              </div>
            </div>
            <CardDataStats
              icon={<MdAttachMoney className="text-xl" />}
              dataCount={totalRevenueFormat}
              label={"Tổng doanh thu"}
              isScaleHover={false}
              //   percent={"50.7"}
              //   iconPercent={<FaArrowUp />}
              //   colorPercent={"text-green-500"}
              //   onClick={handleRevenueTotalModal}
            />
            <div className="bg-[#32353b]  rounded-sm pb-2">
              <ChartDashboardRevenue
                nameChart={"Thống kê tổng doanh thu"}
                nameParam1={"Doanh thu bán ảnh"}
                nameParam2={"Doanh thu gói dịch vụ"}
                param1={photoSellRevenue}
                param2={photoshootPackageRevenue}
                isMoney={true}
              />
            </div>
          </div>
          <div className="col-span-6 flex flex-col gap-4 ">
            {/* <div className="bg-[#32353b]  rounded-sm">
        <ChartTotalPhotoSoldByDay />
      </div> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#32353b]  rounded-sm col-span-3">
                <TablePhotoListOfPhotographer data={topSoldPhotos} />
              </div>
            </div>
            <div className="bg-[#32353b] rounded-sm">
              <TablePhotoshootOfPhotographer data={topPhotoshootPackages} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotographerDetailStats;
