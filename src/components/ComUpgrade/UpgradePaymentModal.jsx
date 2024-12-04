import { ConfigProvider, Modal, Spin } from "antd";
import React, { useEffect, useState } from "react";
import useModalStore from "../../states/UseModalStore";
import { useKeycloak } from "@react-keycloak/web";
import { TransactionApi } from "../../apis/TransactionApi";
import upgradePackageApi from "../../apis/upgradePackageApi";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useFireworkStore from "../../states/UseFireworkStore";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../Notification/Notification";
import ComPriceConverter from "../ComPriceConverter/ComPriceConverter";
import CountdownTimer from "./CountdownTimer";
import { LoadingOutlined } from "@ant-design/icons";

export default function UpgradePaymentModal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    isUpgradePaymentModal,
    setIsUpgradePaymentModal,
    selectedUpgradePackage,
    setSelectedUpgradePackage,
  } = useModalStore();
  const [tranferType, setTranferType] = useState("");
  const { keycloak } = useKeycloak();
  const { startFireworks, stopFireworks } = useFireworkStore();
  const [isDisable, setIsDisable] = useState(false);
  const [disableWalletPayment, setDisableWalletPayment] = useState(false);
  const [disableSePayPayment, setDisableSePayPayment] = useState(false);
  // Fetch transaction details based on selected transaction ID
  const { data: transactionDetail, refetch } = useQuery({
    queryKey: ["getTransactionById", selectedUpgradePackage?.transactionId],
    queryFn: () =>
      TransactionApi.getTransactionById(selectedUpgradePackage.transactionId),
    enabled: !!selectedUpgradePackage?.transactionId, // Only fetch if ID is available
  });
  const upgradePackage = useMutation({
    mutationKey: "upgrade-package",
    mutationFn: async (data) => await upgradePackageApi.upgradeOrder(data),
    onSuccess: (data) => {
      if (tranferType === "SEPAY") {
        setSelectedUpgradePackage({
          ...selectedUpgradePackage, // Keep existing properties
          transactionId: data.serviceTransaction.transaction.id, // Update or add new properties
          mockQrCode: data.mockQrCode, // Update or add new properties
        });
      } else {
        // notificationApi(
        //   "success",
        //   "Nâng cấp gói thành công",
        //   "Vui lòng kiểm tra lại giao lịch của bạn"
        // );
        //call keycloak update token method, with -1 minValidity it will update immediately
        keycloak.updateToken(-1).then(() => {});
        startFireworks();
        setTimeout(() => {
          setIsUpgradePaymentModal(false);
          setIsDisable(false);
          setDisableSePayPayment(false);
          stopFireworks();
          queryClient.invalidateQueries("upgrade-package-list");
          queryClient.invalidateQueries("getTransactionById");
          navigate("/profile/wallet");
        }, 3000);
      }
    },
    onError: (error) => {
      setIsDisable(false);
      setDisableWalletPayment(false);
      setDisableSePayPayment(false);
      console.log("Error:", error.response.data.message);
      let message;
      switch (error.response.data.message) {
        case "UserHasActivatedUpgradePackage":
          message = "Hiện tại bạn đã có gói nâng cấp đang hoạt động.";
          break;
        case "NotEnoughBalanceException":
          message = "Số dư không đủ để thực hiện giao dịch.";
          break;
        case "CannotTransferToTheSameUpgradePackage":
          message = "Không thể chuyển thành gói nâng cấp hiện tại.";
          break;
        default:
          message = "Đã xảy ra lỗi, vui lòng thử lại sau.";
          break;
      }
      console.error("Error message:", message);
      notificationApi("error", "Nâng cấp gói thất bại", message);
    },
  });
  const handleUpgrade = () => {
    setIsDisable(true);
    if (tranferType === "SEPAY") {
      setDisableWalletPayment(true);
    } else {
      setDisableSePayPayment(true);
    }
    upgradePackage.mutate({
      paymentMethod: tranferType,
      acceptTransfer: true,
      acceptRemovePendingUpgradeOrder: true,
      upgradePackageId: selectedUpgradePackage.id,
      totalMonths: selectedUpgradePackage.minOrderMonth,
    });
  };

  // Polling logic: refetch the query every 3 seconds when the modal is open
  useEffect(() => {
    // let interval;
    // Polling logic
    // if (isUpgradePaymentModal && transactionDetail) {
    //   interval = setInterval(() => {
    //     refetch();
    //   }, 3000);
    // }

    // Success and expiration logic
    if (isUpgradePaymentModal && transactionDetail) {
      console.log("transactionUpgrade", transactionDetail);
      if (transactionDetail.status === "SUCCESS") {
        keycloak.updateToken(-1).then(() => {});
        startFireworks();
        // notificationApi(
        //   "success",
        //   "Nâng cấp gói thành công",
        //   "Vui lòng kiểm tra lại giao lịch của bạn"
        // );
        setTimeout(() => {
          stopFireworks();
          setIsUpgradePaymentModal(false);
          setIsDisable(false);
          setDisableWalletPayment(false);
          queryClient.invalidateQueries("upgrade-package-list");
          queryClient.invalidateQueries("getTransactionById");
          navigate("/profile/wallet");
        }, 3000);
      }

      if (transactionDetail.status === "EXPIRED") {
        setIsDisable(false);

        setIsUpgradePaymentModal(false);
        notificationApi(
          "error",
          "Mã QR hết hiệu lực",
          "Mã QR hết hiệu lực, bạn vui lòng thử lại sau"
        );
      }
    }

    // Cleanup function to stop polling when modal closes or component unmounts
    // return () => clearInterval(interval);
  }, [isUpgradePaymentModal, transactionDetail, selectedUpgradePackage]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "#1f2937",
            headerBg: "#1f2937",
            titleColor: "white",
          },
        },
      }}
    >
      <Modal
        visible={isUpgradePaymentModal}
        onCancel={() => setIsUpgradePaymentModal(false)}
        footer={null}
        centered={true}
        width="610px" // Increase modal width for larger size
        className="custom-close-icon"
      >
        <div className="flex justify-center">
          <div className="bg-gray-800 text-white rounded-lg w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <button
                onClick={() => setIsUpgradePaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                {/* Adjusted icon size */}
              </button>
              <h2 className="text-2xl font-semibold">Hóa đơn</h2>{" "}
              {/* Downgraded to text-2xl */}
              <div className="w-6"></div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              {" "}
              {/* Reduced padding and gap */}
              {/* Payment Method Selection */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">
                  {" "}
                  {/* Reduced to text-xl */}
                  Chọn phương thức thanh toán:
                </h3>
                <div className="space-y-4">
                  {" "}
                  {/* Reduced spacing */}
                  <button
                    className={`w-full py-3 rounded-lg ${
                      tranferType === "SEPAY"
                        ? "bg-white text-gray-900"
                        : "bg-gray-700 text-white"
                    } ${disableSePayPayment ? "cursor-not-allowed" : ""}`}
                    onClick={() => setTranferType("SEPAY")}
                    disabled={disableSePayPayment}
                  >
                    <span className="text-base">
                      Thanh toán bằng mã QR (SEPAY)
                    </span>{" "}
                    {/* Downgraded to text-base */}
                  </button>
                  <button
                    className={`w-full py-3 rounded-lg ${
                      tranferType === "WALLET"
                        ? "bg-white text-gray-900"
                        : "bg-gray-700 text-white"
                    } ${disableWalletPayment ? "cursor-not-allowed" : ""}`}
                    disabled={disableWalletPayment}
                    onClick={() => setTranferType("WALLET")}
                  >
                    <span className="text-base"> Thanh toán bằng ví</span>
                  </button>
                </div>

                {/* QR Code Display */}
                {tranferType === "SEPAY" &&
                  selectedUpgradePackage.mockQrCode && (
                    <div className="p-8 flex flex-col items-center mt-auto">
                      <img
                        src={selectedUpgradePackage?.mockQrCode}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                      {transactionDetail?.status === "PENDING" && (
                        <div className="text-center text-yellow-500 text-base mt-4">
                          Đang chờ thanh toán...
                          <CountdownTimer />
                        </div>
                      )}
                    </div>
                  )}
              </div>
              {/* Order Summary */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>{" "}
                {/* Reduced to text-xl */}
                <div className="space-y-4">
                  {" "}
                  {/* Reduced spacing */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-base">
                        {" "}
                        {/* Reduced to text-base */}
                        Gói {selectedUpgradePackage.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {" "}
                        {/* Reduced to text-sm */}
                        {selectedUpgradePackage.maxPackageCount} gói dịch vụ
                      </p>
                      <p className="text-gray-400 text-sm">
                        {" "}
                        {/* Reduced to text-sm */}
                        {(
                          selectedUpgradePackage.maxPhotoQuota /
                          1024 ** 3
                        ).toFixed(3)}{" "}
                        GB
                      </p>
                      <p className="text-gray-400 text-sm">
                        {" "}
                        {/* Reduced to text-sm */}
                        {selectedUpgradePackage.minOrderMonth} tháng
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-base">
                        <ComPriceConverter>
                          {selectedUpgradePackage?.migratePrice || 0}
                        </ComPriceConverter>
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-base">
                        {" "}
                        {/* Reduced to text-base */}
                        Tổng tiền phải trả
                      </span>
                      <span className="font-semibold text-xl">
                        {" "}
                        {/* Reduced to text-xl */}
                        <ComPriceConverter>
                          {selectedUpgradePackage?.migratePrice || 0}
                        </ComPriceConverter>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {tranferType === "WALLET" && (
              <button
                className="w-full bg-white text-gray-900 rounded-lg py-3 font-semibold text-base hover:bg-gray-200 transition-colors"
                onClick={handleUpgrade}
                disabled={isDisable}
              >
                {isDisable ? (
                  <Spin indicator={<LoadingOutlined spin />} />
                ) : (
                  "Xác nhận thanh toán"
                )}
              </button>
            )}
            {tranferType === "SEPAY" && !selectedUpgradePackage.mockQrCode && (
              <button
                className="w-full bg-white text-gray-900 rounded-lg py-3 font-semibold text-base hover:bg-gray-200 transition-colors"
                onClick={handleUpgrade}
              >
                Lấy mã QR
              </button>
            )}

            <p className="text-sm text-gray-400 text-center mt-2">
              Thanh toán sẽ tự động
            </p>

            {/* Payment Status Messages */}
            {transactionDetail?.status === "SUCCESS" && (
              <div className="p-4 text-center text-green-500 text-lg">
                {" "}
                {/* Reduced to text-lg */}
                Thanh toán thành công!
              </div>
            )}
            {transactionDetail?.status === "FAILED" && (
              <div className="p-4 text-center text-red-500 text-lg">
                {" "}
                {/* Reduced to text-lg */}
                Thanh toán thất bại, vui lòng thử lại.
              </div>
            )}
            {transactionDetail?.status === "EXPIRED" && (
              <div className="p-4 text-center text-red-500 text-lg">
                {" "}
                {/* Reduced to text-lg */}
                Mã QR quá hạn, vui lòng thử lại.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}
