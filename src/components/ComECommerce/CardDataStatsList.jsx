import React from "react";
import CardDataStats from "./CardDataStats";
import { FiImage, FiPackage, FiUsers } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { ConfigProvider, Modal } from "antd";
import ChartDashboardRevenue from "./ChartDashboardRevenue";
import formatPrice from "./../../utils/FormatPriceUtils";

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
  const totalPhotoNotSelling = photoTotal - totalPhotoSelling;
  const revenueFromSellingPhoto = dashBoardData?.revenueFromSellingPhoto;
  const revenueFromUpgradePackage = dashBoardData?.revenueFromUpgradePackage;

  const handleUserTotalModal = () => {
    setIsOpenUserTotal(!isOpenUserTotal);
  };

  const handlePhotoTotalModal = () => {
    setIsOpenPhotoTotal(!isOpenPhotoTotal);
  };

  const handleRevenueTotalModal = () => {
    setIsOpenRevenueTotal(!isOpenRevenueTotal);
  };
  return (
    <>
      {/* Modal */}
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#292b2f",
              headerBg: "#292b2f",
              titleColor: "white",
            },
          },
        }}
      >
        <Modal
          title="Thống kê tổng số người đăng ký"
          visible={isOpenUserTotal} // Use state from Zustand store
          onCancel={handleUserTotalModal} // Close the modal on cancel
          footer={null}
          width={600} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <ChartDashboardRevenue
            nameChart={"Thống kê tổng số người đăng ký"}
            nameParam1={"Tổng số khách hàng"}
            nameParam2={"Tổng số nhiếp ảnh gia"}
            param1={totalCustomer}
            param2={totalPhotographer}
          />
        </Modal>
        <Modal
          title="Thống kê tổng số ảnh"
          visible={isOpenPhotoTotal} // Use state from Zustand store
          onCancel={handlePhotoTotalModal} // Close the modal on cancel
          footer={null}
          width={600} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <ChartDashboardRevenue
            nameChart={"Thống kê tổng số ảnh"}
            param1={totalPhotoSelling}
            nameParam1={"Tổng số ảnh bán"}
            param2={totalPhotoNotSelling}
            nameParam2={"Tổng số ảnh không bán"}
          />
        </Modal>
        <Modal
          title="Thống kê tổng số doanh thu"
          visible={isOpenRevenueTotal} // Use state from Zustand store
          onCancel={handleRevenueTotalModal} // Close the modal on cancel
          footer={null}
          width={600} // Set the width of the modal
          centered={true}
          className="custom-close-icon"
        >
          <ChartDashboardRevenue
            nameChart={"Thống kê tổng doanh thu"}
            nameParam1={"Doanh thu bán ảnh"}
            nameParam2={"Doanh thu gói nâng cấp"}
            param1={revenueFromSellingPhoto}
            param2={revenueFromUpgradePackage}
            isMoney={true}
          />
        </Modal>
      </ConfigProvider>

      {/* Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-5">
        <CardDataStats
          icon={<FiUsers className="text-xl" />}
          dataCount={userTotal}
          label="Tổng số người đăng ký"
          // percent={"26.8"}
          // iconPercent={<FaArrowUp />}
          // colorPercent={"text-green-500"}
          link={"total-users"}
          onClick={handleUserTotalModal}
        />
        <CardDataStats
          icon={<FiImage className="text-xl" />}
          dataCount={photoTotal}
          label={"Tổng số ảnh"}
          // percent={"2.8"}
          // iconPercent={<FaArrowDown />}
          // colorPercent={"text-red-500"}
          onClick={handlePhotoTotalModal}
        />
        <CardDataStats
          icon={<FiPackage className="text-xl" />}
          dataCount={photoshootPackage}
          label={"Tổng số gói dịch vụ"}
          // percent={"30.6"}
          // iconPercent={<FaArrowUp />}
          // colorPercent={"text-green-500"}
        />
        <CardDataStats
          icon={<MdAttachMoney className="text-xl" />}
          dataCount={totalRevenue}
          label={"Tổng doanh thu"}
          // percent={"50.7"}
          // iconPercent={<FaArrowUp />}
          // colorPercent={"text-green-500"}
          onClick={handleRevenueTotalModal}
        />
      </div>
    </>
  );
};

export default CardDataStatsList;
