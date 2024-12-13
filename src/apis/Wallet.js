import http, { externalHttp } from "../configs/Http";

const getWallet = async () => {
  const response = await http.get("/wallet");

  return response.data;
};
const getTransaction = async ({
  limit,
  page,
  types,
  statuses,
  paymentMethods,
  orderByCreatedAt,
}) => {
  // limit=10&page=0&types=DEPOSIT&statuses=CANCEL&paymentMethods=WALLET&orderByCreatedAt=desc
  const response = await http.get(
    `/wallet/transaction?limit=${limit}&page=${page}&${
      types === "" ? "" : "types=" + types
    }&${statuses === "" ? "status=" + statuses : ""}&${
      paymentMethods === "" ? "paymentMethod=" + paymentMethods : ""
    }&orderByCreatedAt=${orderByCreatedAt}`
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
