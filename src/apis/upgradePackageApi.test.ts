import { mockEndpoint } from "../test/mockEndpoint";
import upgradePackageApi from "./upgradePackageApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("upgradePackageApi", () => {
  it("upgradePackageList asks for the first 9 packages", async () => {
    const requests = mockEndpoint("get", "*/upgrade-package", {
      objects: [{ id: "up1" }],
      totalPage: 1,
    });

    await expect(upgradePackageApi.upgradePackageList()).resolves.toEqual({
      objects: [{ id: "up1" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/upgrade-package",
        query: { limit: "9", page: "0" },
      }),
    ]);
  });

  it("getCurrentPackage returns my current upgrade", async () => {
    const requests = mockEndpoint("get", "*/me/current-upgrade-package", {
      id: "order1",
    });

    await expect(upgradePackageApi.getCurrentPackage()).resolves.toEqual({
      id: "order1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/me/current-upgrade-package",
      }),
    ]);
  });

  it("upgradeOrder posts the order with the confirmation flags", async () => {
    const requests = mockEndpoint("post", "*/upgrade-order", {
      transactionId: "t1",
    });
    const order = {
      paymentMethod: "SEPAY" as const,
      acceptTransfer: true,
      acceptRemovePendingUpgradeOrder: true,
      upgradePackageId: "up1",
      totalMonths: 3,
    };

    await expect(upgradePackageApi.upgradeOrder(order)).resolves.toEqual({
      transactionId: "t1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/upgrade-order",
        json: order,
      }),
    ]);
  });

  it("checkTranferFeeForMigratePackage asks for the fee of the months", async () => {
    const requests = mockEndpoint(
      "get",
      "*/upgrade-order/upgrade-package/up1/fee",
      { fee: 1000 },
    );

    await expect(
      upgradePackageApi.checkTranferFeeForMigratePackage("up1", 6),
    ).resolves.toEqual({ fee: 1000 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/upgrade-order/upgrade-package/up1/fee",
        query: { totalMonths: "6" },
      }),
    ]);
  });
});
