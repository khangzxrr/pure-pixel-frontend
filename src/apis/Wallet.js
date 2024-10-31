import http, { externalHttp } from "../configs/Http";

const getWallet = async () => {
  const response = await http.get("/wallet");

  return response.data;
};
const getTransaction = async (
  limit,
  page,
  type,
  status,
  orderByAmount,
  orderByCreatedAt
) => {
  // const response = await http.get(
  //     "/wallet/transaction?limit=10&page=0&orderByPaymentMethod=asc&orderByAmount=asc&orderByType=asc&orderByCreatedAt=asc"
  //   );
  const response = await http.get(
    `/wallet/transaction?limit=${limit}&page=${page}&${
      type ? "type=" + type : ""
    }&${
      status ? "status=" + status : ""
    }&orderByPaymentMethod=asc&orderByAmount=${orderByAmount}&orderByType=asc&orderByCreatedAt=${orderByCreatedAt}`
  );
  return response.data;
};

const createDeposit = async (amount) => {
  const response = await http.post("/wallet/deposit", amount);

  return response.data;
};

const createWithdrawal = async (data) => {
  const response = await http.post("/wallet/withdrawal", data);

  return response.data;
};

const bankList = async () => {
  const response = await externalHttp.get("https://api.vietqr.io/v2/banks");

  return response.data;
};
export const WalletApi = {
  getWallet,
  getTransaction,
  createDeposit,
  createWithdrawal,
  bankList,
};
