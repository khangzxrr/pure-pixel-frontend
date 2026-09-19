import http, { timeoutHttpClient } from "../configs/Http";
import type { ResponseOf } from "./types";
const customHttp = timeoutHttpClient(300000);

const acceptWithdrawal = async (transactionId: string, photo: Blob) => {
  // console.log("transactionId", transactionId, photo);
  const formData = new FormData();

  formData.append("photo", photo);

  const response = await customHttp.patch<
    ResponseOf<"ManageTransactionController_acceptWithdrawal">
  >(`/manager/transaction/${transactionId}/withdrawal/accept`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // Uncomment this if you want to track upload progress
    // onUploadProgress,
  });
  return response.data;
};
const denyWithdrawal = async (transactionId: string, failReason: string) => {
  const response = await http.patch<
    ResponseOf<"ManageTransactionController_denyWithdrawal">
  >(`/manager/transaction/${transactionId}/withdrawal/deny`, {
    failReason,
  });
  return response.data;
};

const ManageTracsaction = {
  acceptWithdrawal,
  denyWithdrawal,
};
export default ManageTracsaction;
