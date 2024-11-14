import http, { externalHttp } from "../configs/Http";

const getTransactionById = async (transactionId) => {
  const response = await http.get(`/payment/transaction/` + transactionId);

  return response.data;
};

const generatePaymentUrl = async (transactionId) => {
  const response = await http.post(
    `/payment/transaction/${transactionId}/generate-payment-url`
  );

  return response.data;
};

export const TransactionApi = {
  getTransactionById,
  generatePaymentUrl,
};
