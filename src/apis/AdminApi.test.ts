import { mockEndpoint } from "../test/mockEndpoint";
import AdminApi from "./AdminApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// "+" must stay encoded, otherwise the server reads it as a space
const from = "2024-10-19T01:30:14.761+07:00";
const to = "2024-10-20T01:30:14.761+07:00";

describe("AdminApi", () => {
  it("getDashboard sends the encoded date range and returns the report", async () => {
    const requests = mockEndpoint("get", "*/admin/dashboard", { totalUser: 3 });

    await expect(AdminApi.getDashboard(from, to)).resolves.toEqual({
      totalUser: 3,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/admin/dashboard",
        query: { fromDate: from, toDate: to },
      }),
    ]);
  });

  it("getTopSellerDashboard sends the date range and returns the sellers", async () => {
    const requests = mockEndpoint("get", "*/admin/dashboard/top-seller", [
      { user: { id: "u1" } },
    ]);

    await expect(AdminApi.getTopSellerDashboard(from, to)).resolves.toEqual([
      { user: { id: "u1" } },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/admin/dashboard/top-seller",
        query: { fromDate: from, toDate: to },
      }),
    ]);
  });

  it("getSellerByIdDashboard targets the seller and returns its details", async () => {
    const requests = mockEndpoint("get", "*/admin/dashboard/top-seller/u1", {
      photoSellRevenue: 10,
    });

    await expect(
      AdminApi.getSellerByIdDashboard("u1", from, to),
    ).resolves.toEqual({ photoSellRevenue: 10 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/admin/dashboard/top-seller/u1",
        query: { fromDate: from, toDate: to },
      }),
    ]);
  });

  it("getUserManager pages through users", async () => {
    const requests = mockEndpoint("get", "*/user", {
      objects: [],
      totalPage: 0,
    });

    await expect(AdminApi.getUserManager(10, 2)).resolves.toEqual({
      objects: [],
      totalPage: 0,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/user",
        query: { limit: "10", page: "2" },
      }),
    ]);
  });

  it("getUserById returns the user", async () => {
    const requests = mockEndpoint("get", "*/user/u1", { id: "u1" });

    await expect(AdminApi.getUserById("u1")).resolves.toEqual({ id: "u1" });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/user/u1", query: {} }),
    ]);
  });

  it("updateUser patches the user with the body", async () => {
    const requests = mockEndpoint("patch", "*/user/u1", {
      id: "u1",
      name: "An",
    });

    await expect(
      AdminApi.updateUser("u1", { name: "An", enabled: false }),
    ).resolves.toEqual({ id: "u1", name: "An" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/user/u1",
        json: { name: "An", enabled: false },
      }),
    ]);
  });
});
