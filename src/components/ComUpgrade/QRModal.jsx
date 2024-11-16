import React, { useEffect } from "react";
import { Modal } from "antd";
import useModalStore from "../../states/UseModalStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionApi } from "../../apis/TransactionApi";
import { useNotification } from "../../Notification/Notification";

import { useKeycloak } from "@react-keycloak/web";
import { number } from "yup";

import { CheckCircleOutlined } from "@ant-design/icons";
import useFireworkStore from "../../states/UseFireworkStore";
import useUpgradePackageStore from "../../states/UseUpgradePackageStore";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "./CountdownTimer"; // Ensure the import matches the file name exactly

export default function QRModal() {
  const {
    isUpgradePackageQRModal,
    setIsUpgradePackageQRModal,
    selectedUpgradePackage,
  } = useModalStore();
  const { setIsUpgraded } = useUpgradePackageStore();
  const { startFireworks, stopFireworks } = useFireworkStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notificationApi } = useNotification();

  const { keycloak } = useKeycloak();

  // Fetch transaction details based on selected transaction ID
  const { data: transactionDetail, refetch } = useQuery({
    queryKey: ["getTransactionById", selectedUpgradePackage?.transactionId],
    queryFn: () =>
      TransactionApi.getTransactionById(selectedUpgradePackage.transactionId),
    enabled: !!selectedUpgradePackage?.transactionId, // Only fetch if ID is available
  });

  // Polling logic: refetch the query every 3 seconds when the modal is open
  useEffect(() => {
    let interval;
    if (isUpgradePackageQRModal) {
      interval = setInterval(() => {
        refetch();
      }, 3000);
    }

    // Cleanup function to clear the interval when component unmounts or modal closes
    return () => clearInterval(interval);
  }, [isUpgradePackageQRModal, refetch]);

  // Stop polling and close modal when transaction is successful
  useEffect(() => {
    if (isUpgradePackageQRModal && transactionDetail?.status === "SUCCESS") {
      notificationApi(
        "success",
        "Nâng cấp gói thành công",
        "Bây giờ bạn có thể trải nghiệm gói mới của mình"
      );
      //call keycloak update token method, with -1 minValidity it will update immediately
      keycloak.updateToken(-1).then(() => {});
      startFireworks();
      setTimeout(() => {
        stopFireworks();
        setIsUpgradePackageQRModal(false);
        setIsUpgraded(true);
        queryClient.invalidateQueries("upgrade-package-list");
        queryClient.invalidateQueries("getTransactionById");
        navigate("/upload/public");
      }, 3000);
    }
    if (transactionDetail?.status === "EXPIRED") {
      setIsUpgradePackageQRModal(false);
      notificationApi(
        "error",
        "Mã QR hết hiệu lực",
        "Mã QR hết hiệu lực, bạn vui lòng thử lại sau"
      );
    }
  }, [
    transactionDetail,
    setIsUpgradePackageQRModal,
    notificationApi,
    queryClient,
  ]);
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
        <div className="flex flex-col h-4/5">
          <img
            className="h-[500px]"
            src={selectedUpgradePackage?.mockQrCode}
            alt="QR Code"
          />
          <CountdownTimer />
        </div>
      )}
    </Modal>
  );
}
