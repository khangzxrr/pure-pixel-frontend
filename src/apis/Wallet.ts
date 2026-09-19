import http, { externalHttp } from "../configs/Http";
import type { BodyOf, QueryOf, ResponseOf, Schema } from "./types";

// one filter value per list, "" when the filter is off
export type WalletTransactionFilter = {
  limit: number;
  page: number;
  types: Schema<"TransactionType"> | "";
  statuses: Schema<"TransactionStatus"> | "";
  paymentMethods: Schema<"PaymentMethod"> | "";
  orderByCreatedAt: QueryOf<"WalletController_getTransactions">["orderByCreatedAt"];
};

// the part of the VietQR bank list response the app reads
export type VietQrBankListResponse = {
  data: { name: string }[];
};

const getWallet = async () => {
  const response =
    await http.get<ResponseOf<"WalletController_getWallet">>("/wallet");

  return response.data;
};
const getTransaction = async ({
  limit,
  page,
  types,
  statuses,
  paymentMethods,
  orderByCreatedAt,
}: WalletTransactionFilter) => {
  // limit=10&page=0&types=DEPOSIT&statuses=CANCEL&paymentMethods=WALLET&orderByCreatedAt=desc
  const response = await http.get<
    ResponseOf<"WalletController_getTransactions">
  >(
    `/wallet/transaction?limit=${limit}&page=${page}${
      types === "" ? "" : "&types=" + types
    }${statuses === "" ? "" : "&statuses=" + statuses}${
      paymentMethods === "" ? "" : "&paymentMethods=" + paymentMethods
    }&orderByCreatedAt=${orderByCreatedAt}`,
  );
  return response.data;
};

const createDeposit = async (
  amount: BodyOf<"WalletController_createDeposit">,
) => {
  const response = await http.post<
    ResponseOf<"WalletController_createDeposit">
  >("/wallet/deposit", amount);

  return response.data;
};

const createWithdrawal = async (
  data: BodyOf<"WalletController_createWithdrawal">,
) => {
  const response = await http.post<
    ResponseOf<"WalletController_createWithdrawal">
  >("/wallet/withdrawal", data);

  return response.data;
};

const bankList = async () => {
  const response = await externalHttp.get<VietQrBankListResponse>(
    "https://api.vietqr.io/v2/banks",
  );

  return response.data;
};
export const WalletApi = {
  getWallet,
  getTransaction,
  createDeposit,
  createWithdrawal,
  bankList,
};
