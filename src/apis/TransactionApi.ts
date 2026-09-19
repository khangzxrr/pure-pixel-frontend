import http from "../configs/Http";
import type { ResponseOf } from "./types";

const getTransactionById = async (transactionId: string) => {
  const response = await http.get<
    ResponseOf<"TransactionController_getTransactionById">
  >(`/payment/transaction/` + transactionId);

  return response.data;
};

const generatePaymentUrl = async (transactionId: string) => {
  const response = await http.post<
    ResponseOf<"TransactionController_generatePaymentUrl">
  >(`/payment/transaction/${transactionId}/generate-payment-url`);

  return response.data;
};

export const TransactionApi = {
  getTransactionById,
  generatePaymentUrl,
};
