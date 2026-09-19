import { mockEndpoint } from "../test/mockEndpoint";
import { PhotographerBookingApi } from "./PhotographerBookingApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PhotographerBookingApi", () => {
  it("findAllBooking filters by status when given", async () => {
    const requests = mockEndpoint("get", "*/photographer/booking/me", {
      objects: [{ id: "b1" }],
      totalPage: 1,
    });

    await expect(
      PhotographerBookingApi.findAllBooking(10, 0, "REQUESTED", "desc"),
    ).resolves.toEqual({ objects: [{ id: "b1" }], totalPage: 1 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photographer/booking/me",
        query: {
          limit: "10",
          page: "0",
          status: "REQUESTED",
          orderByCreatedAt: "desc",
        },
      }),
    ]);
  });

  it("findAllBooking leaves the status out when empty", async () => {
    const requests = mockEndpoint("get", "*/photographer/booking/me");

    await PhotographerBookingApi.findAllBooking(10, 2, "", "asc");

    expect(requests[0].query).toEqual({
      limit: "10",
      page: "2",
      orderByCreatedAt: "asc",
    });
  });

  it("findById returns the booking", async () => {
    const requests = mockEndpoint("get", "*/photographer/booking/b1", {
      id: "b1",
    });

    await expect(PhotographerBookingApi.findById("b1")).resolves.toEqual({
      id: "b1",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/photographer/booking/b1" }),
    ]);
  });

  it.each([
    ["denyBooking", PhotographerBookingApi.denyBooking, "post", "deny"],
    ["acceptBooking", PhotographerBookingApi.acceptBooking, "post", "accept"],
    ["paidBooking", PhotographerBookingApi.paidBooking, "patch", "paid"],
  ] as const)("%s calls the %s route", async (_name, action, method, segment) => {
    const path = `/photographer/booking/b1/${segment}`;
    const requests = mockEndpoint(method, `*${path}`, { id: "b1" });

    await expect(action("b1")).resolves.toEqual({ id: "b1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: method.toUpperCase(),
        path,
        json: undefined,
      }),
    ]);
  });

  it("deleteBookingPhoto deletes the photo from the booking", async () => {
    const requests = mockEndpoint(
      "delete",
      "*/photographer/booking/b1/photo/p1",
      { id: "p1" },
    );

    await expect(
      PhotographerBookingApi.deleteBookingPhoto("b1", "p1"),
    ).resolves.toEqual({ id: "p1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "DELETE",
        path: "/photographer/booking/b1/photo/p1",
      }),
    ]);
  });

  it("upload puts the photo as multipart", async () => {
    const requests = mockEndpoint("put", "*/photographer/booking/b1/upload", {
      id: "p1",
    });
    const file = new File(["img"], "shot.jpg", { type: "image/jpeg" });

    await expect(PhotographerBookingApi.upload("b1", file)).resolves.toEqual({
      id: "p1",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PUT");
    expect(requests[0].path).toBe("/photographer/booking/b1/upload");
    expect((requests[0].form?.get("file") as File).name).toBe("shot.jpg");
  });
});
