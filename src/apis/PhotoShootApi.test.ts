import { mockEndpoint } from "../test/mockEndpoint";
import PhotoShootApi from "./PhotoShootApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PhotoShootApi", () => {
  it("getPhotoShootPackageById returns the package", async () => {
    const requests = mockEndpoint("get", "*/photoshoot-package/pk1", {
      id: "pk1",
    });

    await expect(PhotoShootApi.getPhotoShootPackageById("pk1")).resolves.toEqual(
      { id: "pk1" },
    );
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/photoshoot-package/pk1" }),
    ]);
  });

  it("getBookingByCustomer always asks for the first 10 bookings", async () => {
    const requests = mockEndpoint("get", "*/customer/booking/me", {
      objects: [],
      totalPage: 0,
    });

    await expect(PhotoShootApi.getBookingByCustomer(5, 3)).resolves.toEqual({
      objects: [],
      totalPage: 0,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/customer/booking/me",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });

  it("handleRequestByPhotographer posts to the chosen action", async () => {
    const requests = mockEndpoint("post", "*/photographer/booking/b1/accept", {
      id: "b1",
    });

    await expect(
      PhotoShootApi.handleRequestByPhotographer("b1", "accept"),
    ).resolves.toEqual({ id: "b1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photographer/booking/b1/accept",
      }),
    ]);
  });

  it("getBookingDetail returns the booking", async () => {
    const requests = mockEndpoint("get", "*/photographer/booking/b1", {
      id: "b1",
    });

    await expect(PhotoShootApi.getBookingDetail("b1")).resolves.toEqual({
      id: "b1",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/photographer/booking/b1" }),
    ]);
  });

  it("updateBooking patches the booking", async () => {
    const requests = mockEndpoint("patch", "*/photographer/booking/b1", {
      id: "b1",
    });
    const data = {
      description: "Chụp ngoại cảnh",
      startDate: "2026-09-20T08:00:00.000Z",
      endDate: "2026-09-20T11:00:00.000Z",
    };

    await expect(PhotoShootApi.updateBooking("b1", data)).resolves.toEqual({
      id: "b1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/photographer/booking/b1",
        json: data,
      }),
    ]);
  });

  it("uploadBookingPhoto puts the photo as multipart", async () => {
    const requests = mockEndpoint(
      "put",
      "*/photographer/booking/b1/upload/v2",
      { id: "p1" },
    );
    const file = new File(["img"], "shot.jpg", { type: "image/jpeg" });

    await expect(
      PhotoShootApi.uploadBookingPhoto("b1", file, vi.fn()),
    ).resolves.toEqual({ id: "p1" });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("PUT");
    expect(requests[0].path).toBe("/photographer/booking/b1/upload/v2");
    expect((requests[0].form?.get("file") as File).name).toBe("shot.jpg");
  });
});
