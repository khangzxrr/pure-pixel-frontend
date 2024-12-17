import http, { timeoutHttpClient } from "../configs/Http";
const customHttp = timeoutHttpClient(300000);

const acceptWithdrawal = async (transactionId, photo) => {
  console.log("transactionId", transactionId, photo);
  const formData = new FormData();

  formData.append("photo", photo);

  const response = await customHttp.patch(
    `/manager/transaction/${transactionId}/withdrawal/accept`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Uncomment this if you want to track upload progress
      // onUploadProgress,
    }
  );
  return response.data;
};
const denyWithdrawal = async (transactionId, failReason) => {
  const response = await http.patch(
    `/manager/transaction/${transactionId}/withdrawal/deny`,
    {
      failReason,
    }
  );
  return response.data;
};

const ManageTracsaction = {
  acceptWithdrawal,
  denyWithdrawal,
};
export default ManageTracsaction;
