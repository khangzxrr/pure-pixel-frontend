import React, { useEffect } from "react";
import { Modal } from "antd";
import useModalStore from "../../states/UseModalStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionApi } from "../../apis/TransactionApi";
import { useNotification } from "../../Notification/Notification";
import { CheckCircleOutlined } from "@ant-design/icons";
import useFireworkStore from "../../states/UseFireworkStore";
import useUpgradePackageStore from "../../states/UseUpgradePackageStore";

export default function QRModal() {
  const {
    isUpgradePackageQRModal,
    setIsUpgradePackageQRModal,
    selectedUpgradePackage,
  } = useModalStore();
  const { setIsUpgraded } = useUpgradePackageStore();
  const { startFireworks, stopFireworks } = useFireworkStore();
  const queryClient = useQueryClient();
  const { notificationApi } = useNotification();

  // Fetch transaction details based on selected transaction ID
  const { data: transactionDetail, refetch } = useQuery({
    queryKey: ["getTransactionById", selectedUpgradePackage?.transactionId],
    queryFn: () =>
      TransactionApi.getTransactionById(selectedUpgradePackage.transactionId),
    enabled: !!selectedUpgradePackage?.transactionId, // Only fetch if ID is available
  });

  // Polling logic: refetch the query every 3 seconds when the modal is open
  // useEffect(() => {
  //   let interval;
  //   if (isUpgradePackageQRModal) {
  //     interval = setInterval(() => {
  //       refetch();
  //     }, 3000);
  //   }

  //   // Cleanup function to clear the interval when component unmounts or modal closes
  //   return () => clearInterval(interval);
  // }, [isUpgradePackageQRModal, refetch]);

  // Stop polling and close modal when transaction is successful
  // useEffect(() => {
  //   if (transactionDetail?.status === "SUCCESS") {
  //     startFireworks();
  //     // setTimeout(() => {
  //     //   stopFireworks();
  //     //   setIsUpgradePackageQRModal(false);
  //     //   queryClient.invalidateQueries("upgrade-package-list");
  //     //   queryClient.invalidateQueries("getTransactionById");
  //     //   setIsUpgraded(true);
  //     // }, 3000);
  //   }
  // }, [
  //   transactionDetail,
  //   setIsUpgradePackageQRModal,
  //   notificationApi,
  //   queryClient,
  // ]);

  const handleCancel = () => {
    setIsUpgradePackageQRModal(false);
  };

  return (
    <Modal
      title={
        transactionDetail && transactionDetail.status === "SUCCESS"
          ? ""
          : "Vui lòng quét mã để thanh toán nâng cấp gói"
      }
      visible={isUpgradePackageQRModal}
      centered
      footer={null}
      onCancel={handleCancel}
    >
      {transactionDetail && transactionDetail.status === "SUCCESS" ? (
        <div className="text-center">
          <CheckCircleOutlined style={{ fontSize: "48px", color: "#52c41a" }} />
          <h2 className="mt-4">Bạn đã nâng cấp thành công</h2>
          <p>Bạn đã thanh toán thành công, hãy thử đăng ảnh trước nhé!</p>
        </div>
      ) : (
        <div className="flex h-4/5">
          <img
            className="h-[500px]"
            src={selectedUpgradePackage?.mockQrCode}
            alt="QR Code"
          />
        </div>
      )}
    </Modal>
  );
}
