import { mockEndpoint } from "../test/mockEndpoint";
import { TransactionApi } from "./TransactionApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("TransactionApi", () => {
  it("getTransactionById returns the transaction", async () => {
    const requests = mockEndpoint("get", "*/payment/transaction/t1", {
      id: "t1",
      status: "PENDING",
    });

    await expect(TransactionApi.getTransactionById("t1")).resolves.toEqual({
      id: "t1",
      status: "PENDING",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/payment/transaction/t1" }),
    ]);
  });

  it("generatePaymentUrl returns the payment url", async () => {
    const requests = mockEndpoint(
      "post",
      "*/payment/transaction/t1/generate-payment-url",
      { paymentUrl: "https://pay.test/t1" },
    );

    await expect(TransactionApi.generatePaymentUrl("t1")).resolves.toEqual({
      paymentUrl: "https://pay.test/t1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/payment/transaction/t1/generate-payment-url",
      }),
    ]);
  });
});
