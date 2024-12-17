import React, { useEffect } from "react";
import CardDataStats from "./CardDataStats";
import { FiImage, FiPackage, FiUsers } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import ChartDashboardRevenue from "./ChartDashboardRevenue";
import formatPrice from "./../../utils/FormatPriceUtils";
import styles from "./CardDataStatsList.module.css";
import CardBalance from "./CardBalance";
import ChartDashboardTotalPhoto from "./ChartDashboardTotalPhoto";
const CardDataStatsList = ({ data }) => {
  const [isOpenUserTotal, setIsOpenUserTotal] = React.useState(false);
  const [isOpenPhotoTotal, setIsOpenPhotoTotal] = React.useState(false);
  const [isOpenRevenueTotal, setIsOpenRevenueTotal] = React.useState(false);

  const dashBoardData = data;
  const totalCustomer = dashBoardData?.totalCustomer;

  const totalPhotographer = dashBoardData?.totalPhotographer;
  const userTotal = totalCustomer + totalPhotographer;
  const photoTotal = dashBoardData?.totalPhoto;
  const photoshootPackage = dashBoardData?.totalPhotoshootPackage;
  const totalRevenue = formatPrice(dashBoardData?.totalRevenue);
  const totalPhotoSelling = dashBoardData?.totalSellingPhoto;
  const totalPhotoNotSelling = dashBoardData?.totalRawPhoto;
  const totalBookingPhoto = dashBoardData?.totalBookingPhoto;
  const revenueFromSellingPhoto = dashBoardData?.revenueFromSellingPhoto;
  const revenueFromUpgradePackage = dashBoardData?.revenueFromUpgradePackage;
  const totalWithdrawal = dashBoardData?.totalWithdrawal;
  const totalBalance = dashBoardData?.totalBalance;

  const handleUserTotalModal = () => {
    setIsOpenUserTotal(!isOpenUserTotal);
  };

  const handlePhotoTotalModal = () => {
    setIsOpenPhotoTotal(!isOpenPhotoTotal);
  };

  const handleRevenueTotalModal = () => {
    setIsOpenRevenueTotal(!isOpenRevenueTotal);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpenUserTotal(false);
      setIsOpenPhotoTotal(false);
      setIsOpenRevenueTotal(false);
    }
  };

  useEffect(() => {
    if (isOpenUserTotal || isOpenPhotoTotal || isOpenRevenueTotal) {
      document.body.classList.add(styles["modal-open"]);
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove(styles["modal-open"]);
      document.body.style.overflow = "auto";
    }
  }, [isOpenUserTotal, isOpenPhotoTotal, isOpenRevenueTotal]);
  return (
    <>
      {isOpenUserTotal && (
        <div
          onClick={handleOverlayClick}
          className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen flex justify-center items-center`}
        >
          <div className="relative bg-[#292b2f] rounded-sm">
            <div
              onClick={handleUserTotalModal}
              className="absolute top-2 right-2 text-[#eee] p-2 rounded-full hover:bg-[#636363] hover:cursor-pointer transition duration-200"
            >
              <IoClose />
            </div>
            <div className=" p-5 w-[600px]">
              <ChartDashboardRevenue
                nameChart={"Thống kê tổng số người đăng ký"}
                nameParam1={"Tổng số khách hàng"}
                nameParam2={"Tổng số nhiếp ảnh gia"}
                param1={totalCustomer}
                param2={totalPhotographer}
                isUser={true}
              />
            </div>
          </div>
        </div>
      )}
      {isOpenPhotoTotal && (
        <div
          onClick={handleOverlayClick}
          className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen flex justify-center items-center`}
        >
          <div className="relative bg-[#292b2f] rounded-sm">
            <div
              onClick={handlePhotoTotalModal}
              className="absolute top-2 right-2 text-[#eee] p-2 rounded-full hover:bg-[#636363] hover:cursor-pointer transition duration-200"
            >
              <IoClose />
            </div>
            <div className=" p-5 w-[600px]">
              {/* <ChartDashboardRevenue
                nameChart={"Thống kê tổng số ảnh RAW"}
                param1={totalPhotoSelling}
                nameParam1={"Tổng số ảnh bán"}
                param2={totalPhotoNotSelling}
                nameParam2={"Tổng số ảnh không bán"}
              /> */}
              <ChartDashboardTotalPhoto
                nameChart={"Thống kê tổng số ảnh"}
                nameParam1={"Tổng số ảnh bán"}
                param1={totalPhotoSelling}
                nameParam2={"Tổng số ảnh bình thường"}
                param2={totalPhotoNotSelling}
                nameParam3={"Tổng số ảnh gói dịch vụ"}
                param3={totalBookingPhoto}
              />
            </div>
          </div>
        </div>
      )}
      {isOpenRevenueTotal && (
        <div
          onClick={handleOverlayClick}
          className={`fixed inset-0 bg-black bg-opacity-70 z-50 w-screen flex justify-center items-center`}
        >
          <div className="relative bg-[#292b2f] rounded-sm">
            <div
              onClick={handleRevenueTotalModal}
              className="absolute top-2 right-2 text-[#eee] p-2 rounded-full hover:bg-[#636363] hover:cursor-pointer transition duration-200"
            >
              <IoClose />
            </div>
            <div className=" p-5 w-[600px]">
              <ChartDashboardRevenue
                nameChart={"Thống kê tổng doanh thu"}
                nameParam1={"Doanh thu bán ảnh"}
                nameParam2={"Doanh thu gói nâng cấp"}
                param1={revenueFromSellingPhoto}
                param2={revenueFromUpgradePackage}
                isMoney={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-5">
        <CardDataStats
          icon={<FiUsers className="text-xl" />}
          dataCount={userTotal}
          label="Tổng số người đăng ký"
          onClick={handleUserTotalModal}
        />
        <CardDataStats
          icon={<FiImage className="text-xl" />}
          dataCount={photoTotal}
          label={"Tổng số ảnh"}
          onClick={handlePhotoTotalModal}
        />
        <CardDataStats
          icon={<FiPackage className="text-xl" />}
          dataCount={photoshootPackage}
          label={"Tổng số gói dịch vụ"}
          isScaleHover={false}
        />
        <CardBalance balance={totalBalance} withdrawal={totalWithdrawal} />
      </div>
    </>
  );
};

export default CardDataStatsList;
