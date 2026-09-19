import http from "../configs/Http";
import type { BodyOf, ResponseOf } from "./types";

// UpgradePaymentModal also sends these flags, which RequestUpgradeDto does not declare
type UpgradeOrderInput =
  BodyOf<"UpgradeOrderController_requestUpgradePayment"> & {
    acceptTransfer?: boolean;
    acceptRemovePendingUpgradeOrder?: boolean;
  };

const upgradePackageList = async () => {
  const response = await http.get<
    ResponseOf<"UpgradePackageController_findAll">
  >(`/upgrade-package?limit=9&page=0`);
  return response.data;
};
const getCurrentPackage = async () => {
  const response = await http.get<
    ResponseOf<"MeController_getMeCurrentUpgradePackage">
  >(`me/current-upgrade-package`);
  return response.data;
};
const upgradeOrder = async (data: UpgradeOrderInput) => {
  const response = await http.post<
    ResponseOf<"UpgradeOrderController_requestUpgradePayment">
  >(`/upgrade-order`, data);
  return response.data;
};
const checkTranferFeeForMigratePackage = async (
  upgradePackageId: string,
  totalMonths: number,
) => {
  const response = await http.get<
    ResponseOf<"UpgradeOrderController_checkTransferFee">
  >(
    `/upgrade-order/upgrade-package/${upgradePackageId}/fee?totalMonths=${totalMonths}`,
  );
  return response.data;
};
const upgradePackageApi = {
  getCurrentPackage,
  upgradeOrder,
  upgradePackageList,
  checkTranferFeeForMigratePackage,
};

export default upgradePackageApi;
