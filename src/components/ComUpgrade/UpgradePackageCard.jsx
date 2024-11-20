import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import { useNotification } from "../../Notification/Notification";
import upgradePackageApi from "../../apis/upgradePackageApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useKeycloak } from "@react-keycloak/web";
import useModalStore from "../../states/UseModalStore";
import UserService from "../../services/Keycloak";
import UpdatePackageDropdown from "./UpdatePackageDropdown";

const UpgradePackageCard = ({
  packageItem,
  currentPackage,
  popularPackageId,
}) => {
  const { keycloak } = useKeycloak();
  const {
    isUpgradePaymentModal,
    setIsUpgradePaymentModal,
    selectedUpgradePackage,
    setSelectedUpgradePackage,
  } = useModalStore();
  const userData = UserService.getTokenParsed();
  const handleLogin = () => keycloak.login();
  const { notificationApi } = useNotification();
  const { data: tranferData } = useQuery({
    queryKey: [
      "check-migrate-package-fee",
      packageItem.id,
      packageItem.totalMonths,
    ],
    queryFn: () =>
      upgradePackageApi.checkTranferFeeForMigratePackage(
        packageItem.id,
        packageItem.minOrderMonth
      ),
  });

  //check for expired discount
  const isAvailableUpdate = (() => {
    if (!currentPackage?.createAt) return false; // Ensure createAt exists
    const createdAtDate = new Date(currentPackage.createAt); // Convert createAt to a Date object
    const currentDate = new Date(); // Get the current date
    const diffInMs = currentDate - createdAtDate; // Difference in milliseconds
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // Convert milliseconds to days
    return diffInDays > 7; // Check if the difference is more than 7 days
  })();
  //check if this is the current package
  const isCurrentPackage =
    currentPackage &&
    packageItem &&
    currentPackage.upgradePackageHistory.originalUpgradePackageId ===
      packageItem.id;
  const handleOpenPaymentModal = () => {
    setIsUpgradePaymentModal(true);
    setSelectedUpgradePackage({
      id: packageItem.id,
      name: packageItem.name,
      migratePrice: tranferData ? tranferData.remainPrice : 0,
      minOrderMonth: packageItem.minOrderMonth,
      maxPackageCount: packageItem.maxPackageCount,
      maxPhotoQuota: packageItem.maxPhotoQuota,
    });
  };
  return (
    <div className="flex flex-col gap-2 bg-[#292b2f] w-[400px] p-2 px-5 rounded-md">
      <div className="flex items-center justify-between">
        <div className="font-bold text-lg text-yellow-500">
          {packageItem.name}
        </div>
        <div className="font-normal text-sm text-yellow-500">
          {popularPackageId === packageItem.id ? "Phổ biến nhất" : ""}
        </div>
      </div>
      {tranferData ? (
        tranferData.remainPrice === 0 ? (
          <div className="font-bold text-lg">Miễn phí</div>
        ) : (
          <div className="font-bold text-lg">
            {formatPrice(tranferData.remainPrice)} /{" "}
            <span className="text-sm font-normal">
              {packageItem.minOrderMonth} tháng
            </span>
          </div>
        )
      ) : (
        <div className="font-bold text-lg">
          {formatPrice(packageItem.price * packageItem.minOrderMonth)} /{" "}
          <span className="text-sm font-normal">
            {packageItem.minOrderMonth} tháng
          </span>
        </div>
      )}

      {!isAvailableUpdate && (
        <div className="font-light text-sm">
          <s>{formatPrice(packageItem.price * packageItem.minOrderMonth)}</s>
        </div>
      )}

      <div className="flex flex-col min-h-[250px] gap-2 mt-2">
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          {packageItem.maxPackageCount} gói dịch vụ
        </div>
        <div className="pb-2 border-b border-[#949494] text-sm font-normal">
          {(packageItem.maxPhotoQuota / 1024 ** 3).toFixed(3)} GB
        </div>
        {packageItem.descriptions.map((item, index) => (
          <div
            key={index}
            className="pb-2 border-b border-[#949494] text-sm font-normal"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-5 mb-3">
        {!userData ? (
          <button
            onClick={handleLogin}
            className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
          >
            Đăng nhập để sử dụng gói
          </button>
        ) : isCurrentPackage ? (
          <button className="text-green-500 rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200">
            Gói hiện tại của bạn
          </button>
        ) : currentPackage ? (
          <button
            onClick={handleOpenPaymentModal}
            className="bg-yellow-500 text-white rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
          >
            Chuyển gói
          </button>
        ) : (
          <button
            onClick={handleOpenPaymentModal}
            className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
          >
            Nâng cấp
          </button>
        )}
      </div>
    </div>
  );
};

export default UpgradePackageCard;
