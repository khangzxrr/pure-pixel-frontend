import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import { useNotification } from "../../Notification/Notification";
import upgradePackageApi from "../../apis/upgradePackageApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useKeycloak } from "@react-keycloak/web";
import useModalStore from "../../states/UseModalStore";
import UserService from "../../services/Keycloak";

const UpgradePackageCard = ({
  packageItem,
  currentPackage,
  popularPackageId,
}) => {
  const { keycloak } = useKeycloak();
  const { setIsUpgradePackageQRModal, setSelectedUpgradePackage } =
    useModalStore();
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
  console.log("tranferData", tranferData);

  const upgradePackage = useMutation({
    mutationKey: "upgrade-package",
    mutationFn: async (data) => await upgradePackageApi.upgradeOrder(data),
    onSuccess: (data) => {
      setIsUpgradePackageQRModal(true);
      setSelectedUpgradePackage(data);
    },
    onError: (error) => {
      console.log("Error:", error.response.data.message);

      let message;

      switch (error.response.data.message) {
        case "UserHasActivatedUpgradePackage":
          message = "Hiện tại bạn đã có gói nâng cấp đang hoạt động.";
          break;

        default:
          message = "Đã xảy ra lỗi không xác định.";
          break;
      }

      console.error("Error message:", message);

      notificationApi("error", "Nâng cấp gói thất bại", message);
    },
  });

  const handleUpgrade = () => {
    upgradePackage.mutate({
      acceptTransfer: true,
      acceptRemovePendingUpgradeOrder: true,
      upgradePackageId: packageItem.id,
      totalMonths: packageItem.minOrderMonth,
    });
  };

  return (
    <div className="flex flex-col gap-2 bg-[#292b2f] p-2 px-5 rounded-md">
      <div className="flex items-center justify-between">
        <div className="font-bold text-lg text-yellow-500">
          {packageItem.name}
        </div>
        <div className="font-normal text-sm text-yellow-500">
          {popularPackageId === packageItem.id ? "Phổ biến nhất" : ""}
        </div>
      </div>

      <div className="font-bold text-lg">
        {tranferData
          ? formatPrice(tranferData.remainPrice)
          : formatPrice(packageItem.price * packageItem.minOrderMonth)}
        /{" "}
        <span className="text-sm font-normal">
          {packageItem.minOrderMonth} tháng
        </span>
      </div>
      {!isAvailableUpdate && (
        <div className="font-light text-sm">
          <s>{formatPrice(packageItem.price * packageItem.minOrderMonth)}</s>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-2">
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
          <button
            onClick={handleUpgrade}
            className="bg-green-500 text-white rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
          >
            {" "}
            Gia hạn gói
          </button>
        ) : currentPackage ? (
          <button
            onClick={handleUpgrade}
            className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
          >
            Chuyển gói
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
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
