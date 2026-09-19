import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import { CustomerBookingApi } from "./CustomerBookingApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CustomerBookingApi", () => {
  it("findAllBooking filters by status when given", async () => {
    const requests = mockEndpoint("get", "*/customer/booking/me", {
      objects: [{ id: "b1" }],
      totalPage: 1,
    });

    await expect(
      CustomerBookingApi.findAllBooking(10, 0, "ACCEPTED", "desc"),
    ).resolves.toEqual({ objects: [{ id: "b1" }], totalPage: 1 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/customer/booking/me",
        query: {
          limit: "10",
          page: "0",
          status: "ACCEPTED",
          orderByCreatedAt: "desc",
        },
      }),
    ]);
  });

  it("findAllBooking leaves the status out when missing", async () => {
    const requests = mockEndpoint("get", "*/customer/booking/me");

    await CustomerBookingApi.findAllBooking(10, 1, null, "asc");

    expect(requests[0].query).toEqual({
      limit: "10",
      page: "1",
      orderByCreatedAt: "asc",
    });
  });

  it("findById returns the booking", async () => {
    const requests = mockEndpoint("get", "*/customer/booking/b1", { id: "b1" });

    await expect(CustomerBookingApi.findById("b1")).resolves.toEqual({
      id: "b1",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/customer/booking/b1" }),
    ]);
  });

  it("getBillItems asks for the first 10 bill items", async () => {
    const requests = mockEndpoint("get", "*/customer/booking/b1/bill-item", {
      objects: [{ id: "i1" }],
      totalPage: 1,
    });

    await expect(CustomerBookingApi.getBillItems("b1")).resolves.toEqual({
      objects: [{ id: "i1" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/customer/booking/b1/bill-item",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });

  it.each([
    ["reviewBooking", CustomerBookingApi.reviewBooking],
    ["reviewBookingByCustomer", CustomerBookingApi.reviewBookingByCustomer],
  ] as const)("%s posts the review", async (_name, review) => {
    const requests = mockEndpoint("post", "*/customer/booking/b1/review", {
      id: "rv1",
    });
    const body = { star: 5, description: "Tuyệt vời" };

    await expect(review("b1", body)).resolves.toEqual({ id: "rv1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/customer/booking/b1/review",
        json: body,
      }),
    ]);
  });

  it("requestBooking posts the requested dates", async () => {
    const requests = mockEndpoint(
      "post",
      "*/customer/booking/photoshoot-package/pk1/request",
      { id: "b1" },
    );
    const body = {
      startDate: "2026-09-20T08:00:00.000+07:00",
      endDate: "2026-09-20T11:00:00.000+07:00",
      description: "Chụp gia đình",
    };

    await expect(CustomerBookingApi.requestBooking("pk1", body)).resolves.toEqual(
      { id: "b1" },
    );
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/customer/booking/photoshoot-package/pk1/request",
        json: body,
      }),
    ]);
  });

  it("downloadAllPhoto returns the archive as a blob", async () => {
    const requests = mockEndpoint(
      "get",
      "*/customer/booking/b1/download-all",
      () => HttpResponse.text("zip-bytes"),
    );

    const archive = await CustomerBookingApi.downloadAllPhoto("b1");

    expect(archive).toBeInstanceOf(Blob);
    expect(archive.size).toBe("zip-bytes".length);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/customer/booking/b1/download-all",
      }),
    ]);
  });
});
