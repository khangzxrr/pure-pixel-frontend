import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import { useNotification } from "../../Notification/Notification";
import upgradePackageApi from "../../apis/upgradePackageApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useKeycloak } from "@react-keycloak/web";
import useModalStore from "../../states/UseModalStore";
import UserService from "../../services/Keycloak";

const UpgradePackageCard = ({ packageItem }) => {
  const { keycloak } = useKeycloak();
  const { setIsUpgradePackageQRModal, setSelectedUpgradePackage } =
    useModalStore();
  const userData = UserService.getTokenParsed();
  const handleLogin = () => keycloak.login();
  const { notificationApi } = useNotification();

  const { data: currentPackage } = useQuery({
    queryKey: "current-upgrade-package",
    queryFn: async () => await upgradePackageApi.getCurrentPackage(),
  });

  const isCurrentPackage =
    currentPackage && packageItem && currentPackage.id === packageItem.id;
  console.log(isCurrentPackage, currentPackage, packageItem);

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
          message = "Người dùng đã kích hoạt gói nâng cấp.";
          break;

        default:
          message = "Đã xảy ra lỗi không xác định.";
          break;
      }

      console.error("Error message:", message);

      notificationApi("error", "Đăng tải ảnh thất bại", message);
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
        <div className="font-normal text-sm text-yellow-500">Phổ biến nhất</div>
      </div>

      <div className="font-bold text-lg">
        {formatPrice(packageItem.price)}/{" "}
        <span className="text-sm font-normal">
          {packageItem.minOrderMonth} tháng
        </span>
      </div>
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
        ) : !isCurrentPackage ? (
          <button
            onClick={handleUpgrade}
            className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
          >
            Nâng cấp
          </button>
        ) : (
          <button className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200">
            Gói hiện tại của bạn
          </button>
        )}
      </div>
    </div>
  );
};

export default UpgradePackageCard;
