import React, { useEffect } from "react";
import { Modal } from "antd";
import useModalStore from "../../states/UseModalStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionApi } from "../../apis/TransactionApi";
import { useNotification } from "../../Notification/Notification";
import { useKeycloak } from "@react-keycloak/web";
import { number } from "yup";

export default function QRModal() {
  const {
    isUpgradePackageQRModal,
    setIsUpgradePackageQRModal,
    selectedUpgradePackage,
  } = useModalStore();
  const { notificationApi } = useNotification();
  const queryClient = useQueryClient();

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
    if (transactionDetail?.status === "SUCCESS") {
      setIsUpgradePackageQRModal(false);
      notificationApi(
        "success",
        "Nâng cấp gói thành công",
        "Bây giờ bạn có thể trải nghiệm gói mới của mình"
      );
      queryClient.invalidateQueries("upgrade-package-list");
      queryClient.invalidateQueries("getTransactionById");
      //call keycloak update token method, with -1 minValidity it will update immediately
      keycloak.updateToken(-1).then(() => {
      })
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
      title="Vui lòng quét mã để thanh toán nâng cấp gói"
      visible={isUpgradePackageQRModal}
      centered
      footer={null}
      onCancel={handleCancel}
    >
      <div className="flex h-4/5">
        <img
          className="h-[500px]"
          src={selectedUpgradePackage?.mockQrCode}
          alt="QR Code"
        />
      </div>
    </Modal>
  );
}
