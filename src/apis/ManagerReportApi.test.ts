import { mockEndpoint } from "../test/mockEndpoint";
import ManagerReportApi from "./ManagerReportApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("ManagerReportApi", () => {
  it("closeReport patches the report", async () => {
    const requests = mockEndpoint("patch", "*/manager/report/r1", {
      id: "r1",
      reportStatus: "CLOSED",
    });

    await expect(
      ManagerReportApi.closeReport("r1", { reportStatus: "CLOSED" }),
    ).resolves.toEqual({ id: "r1", reportStatus: "CLOSED" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/manager/report/r1",
        json: { reportStatus: "CLOSED" },
      }),
    ]);
  });

  it("getBookingDetail returns the booking", async () => {
    const requests = mockEndpoint("get", "*/manager/booking/b1", { id: "b1" });

    await expect(ManagerReportApi.getBookingDetail("b1")).resolves.toEqual({
      id: "b1",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/manager/booking/b1" }),
    ]);
  });

  it("updateBooking patches the booking status", async () => {
    const requests = mockEndpoint("patch", "*/manager/booking/b1", {
      id: "b1",
      status: "FAILED",
    });

    await expect(
      ManagerReportApi.updateBooking("b1", { status: "FAILED" }),
    ).resolves.toEqual({ id: "b1", status: "FAILED" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/manager/booking/b1",
        json: { status: "FAILED" },
      }),
    ]);
  });
});
