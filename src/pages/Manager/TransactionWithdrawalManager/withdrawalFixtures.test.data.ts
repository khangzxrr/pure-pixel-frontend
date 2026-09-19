import type { Schema } from "../../../apis/types";
import type { WithdrawalTransaction } from "./TableTransactionWithdrawal";

export const user = (
  overrides: Partial<Schema<"UserDto">> = {},
): Schema<"UserDto"> => ({
  id: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  roles: [],
  enabled: true,
  username: "nguyenvana",
  cover: "",
  location: "",
  mail: "a@test.vn",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  avatar: "https://cdn.test/avatar-a.jpg",
  name: "Nguyễn Văn A",
  quote: "",
  ...overrides,
});

// 15/09/2026 10:30 local time
export const requestedAt = new Date(2026, 8, 15, 10, 30).toISOString();

export const withdrawal = (
  overrides: Partial<WithdrawalTransaction> = {},
): WithdrawalTransaction => ({
  id: "t1",
  paymentPayload: {},
  paymentMethod: "WALLET",
  type: "WITHDRAWAL",
  status: "PENDING",
  user: user(),
  amount: 1500000,
  fee: 0,
  wallet: { walletBalance: 250000 },
  createdAt: requestedAt,
  updatedAt: requestedAt,
  userId: "u1",
  withdrawalTransaction: {
    id: "w1",
    bankName: "Vietcombank",
    bankNumber: "0123456789",
    bankUsername: "NGUYEN VAN A",
    failReason: null,
    successPhotoUrl: null,
    transactionId: "t1",
    createdAt: requestedAt,
    updatedAt: requestedAt,
  },
  ...overrides,
});

// "1.500.000 ₫" as the tables print amounts
export const vnd = (amount: number) =>
  amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
