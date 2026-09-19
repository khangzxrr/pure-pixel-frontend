import { mockEndpoint } from "../test/mockEndpoint";
import { WalletApi } from "./Wallet";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("WalletApi", () => {
  it("getWallet returns the balance", async () => {
    const requests = mockEndpoint("get", "*/wallet", { walletBalance: 200000 });

    await expect(WalletApi.getWallet()).resolves.toEqual({
      walletBalance: 200000,
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/wallet" }),
    ]);
  });

  it("getTransaction sends every filter that is set", async () => {
    const requests = mockEndpoint("get", "*/wallet/transaction", {
      objects: [{ id: "t1" }],
      totalPage: 1,
    });

    await expect(
      WalletApi.getTransaction({
        limit: 10,
        page: 0,
        types: "DEPOSIT",
        statuses: "CANCEL",
        paymentMethods: "WALLET",
        orderByCreatedAt: "desc",
      }),
    ).resolves.toEqual({ objects: [{ id: "t1" }], totalPage: 1 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/wallet/transaction",
        query: {
          limit: "10",
          page: "0",
          types: "DEPOSIT",
          statuses: "CANCEL",
          paymentMethods: "WALLET",
          orderByCreatedAt: "desc",
        },
      }),
    ]);
  });

  it("getTransaction leaves empty filters out", async () => {
    const requests = mockEndpoint("get", "*/wallet/transaction");

    await WalletApi.getTransaction({
      limit: 10,
      page: 1,
      types: "",
      statuses: "",
      paymentMethods: "",
      orderByCreatedAt: "asc",
    });

    expect(requests[0].query).toEqual({
      limit: "10",
      page: "1",
      orderByCreatedAt: "asc",
    });
  });

  it("createDeposit posts the amount", async () => {
    const requests = mockEndpoint("post", "*/wallet/deposit", {
      transactionId: "t1",
    });

    await expect(WalletApi.createDeposit({ amount: 50000 })).resolves.toEqual({
      transactionId: "t1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/wallet/deposit",
        json: { amount: 50000 },
      }),
    ]);
  });

  it("createWithdrawal posts the bank details", async () => {
    const requests = mockEndpoint("post", "*/wallet/withdrawal", {
      transactionId: "t2",
    });
    const withdrawal = {
      amount: 100000,
      bankNumber: "0123456789",
      bankName: "Vietcombank",
      bankUsername: "NGUYEN VAN AN",
    };

    await expect(WalletApi.createWithdrawal(withdrawal)).resolves.toEqual({
      transactionId: "t2",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/wallet/withdrawal",
        json: withdrawal,
      }),
    ]);
  });

  it("bankList returns the VietQR bank list", async () => {
    const requests = mockEndpoint("get", "https://api.vietqr.io/v2/banks", {
      data: [{ name: "Vietcombank" }],
    });

    await expect(WalletApi.bankList()).resolves.toEqual({
      data: [{ name: "Vietcombank" }],
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/v2/banks" }),
    ]);
  });
});
