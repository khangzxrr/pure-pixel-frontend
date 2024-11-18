import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import { useNotification } from "../../Notification/Notification";
import useModalStore from "../../states/UseModalStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import upgradePackageApi from "../../apis/upgradePackageApi";
import { Dropdown } from "antd";
import UserService from "../../services/Keycloak";
import { BiDollar, BiDotsVerticalRounded } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import useFireworkStore from "../../states/UseFireworkStore";

export default function UpdatePackageDropdown({ currentPackage, packageItem }) {
  const navigate = useNavigate();
  const [tranferType, setTranferType] = useState("");
  const { keycloak } = useKeycloak();
  const { setIsUpgradePackageQRModal, setSelectedUpgradePackage } =
    useModalStore();
  const { startFireworks, stopFireworks } = useFireworkStore();
  const queryClient = useQueryClient();
  const userData = UserService.getTokenParsed();
  const handleLogin = () => keycloak.login();
  const { notificationApi } = useNotification();
  const isCurrentPackage =
    currentPackage &&
    packageItem &&
    currentPackage.upgradePackageHistory.originalUpgradePackageId ===
      packageItem.id;
  const upgradePackage = useMutation({
    mutationKey: "upgrade-package",
    mutationFn: async (data) => await upgradePackageApi.upgradeOrder(data),
    onSuccess: (data) => {
      if (tranferType === "SEPAY") {
        setIsUpgradePackageQRModal(true);
        setSelectedUpgradePackage(data);
      } else {
        notificationApi(
          "success",
          "Nâng cấp gói thành công",
          "Vui lòng kiểm tra lại giao lịch của bạn"
        );
        //call keycloak update token method, with -1 minValidity it will update immediately
        keycloak.updateToken(-1).then(() => {});
        startFireworks();
        setTimeout(() => {
          stopFireworks();
          queryClient.invalidateQueries("upgrade-package-list");
          queryClient.invalidateQueries("getTransactionById");
          navigate("/profile/wallet");
        }, 3000);
      }
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
  const handleUpgrade = (type) => {
    setTranferType(type);
    upgradePackage.mutate({
      paymentMethod: type,
      acceptTransfer: true,
      acceptRemovePendingUpgradeOrder: true,
      upgradePackageId: packageItem.id,
      totalMonths: packageItem.minOrderMonth,
    });
  };
  const items = [
    {
      key: "1",
      //   icon: <IoPencilOutline />,
      label: <p className="text-yellow-500">Thanh toán bằng ví có sẵn</p>,
      onClick: () => {
        handleUpgrade("WALLET");
      },
    },
    {
      key: "2",
      //   icon: <CgRemove />,
      label: <p className="text-blue-500">Thanh toán bằng QR Code</p>,
      onClick: () => {
        handleUpgrade("SEPAY");
      },
    },
  ];
  return (
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
      ) : (
        <Dropdown
          menu={{ items }}
          overlayClassName="custom-dropdown"
          trigger={["click"]}
        >
          {currentPackage ? (
            <button className="bg-yellow-500 text-white rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200">
              Chuyển gói
            </button>
          ) : (
            <button className="bg-yellow-500 text-[#202225] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200">
              Nâng cấp
            </button>
          )}
        </Dropdown>
      )}
    </div>
  );
}
