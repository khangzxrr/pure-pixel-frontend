import { mockEndpoint } from "../test/mockEndpoint";
import PhotographerApi from "./PhotographerApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PhotographerApi", () => {
  it("getPresignedUploadUrls posts the cross-domain flag", async () => {
    const requests = mockEndpoint("post", "*/photographer/me/upload", {
      url: "https://upload.test",
    });

    await expect(
      PhotographerApi.getPresignedUploadUrls({
        queryKey: ["presigned", { filename: "a.jpg" }],
      }),
    ).resolves.toEqual({ url: "https://upload.test" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photographer/me/upload",
        json: { crossdomain: true },
      }),
    ]);
  });

  it("getAllPhotographers sends only limit and page when no filter is set", async () => {
    const requests = mockEndpoint("get", "*/photographer", {
      objects: [],
      totalPage: 0,
    });

    await expect(
      PhotographerApi.getAllPhotographers(10, 0, null, null, null, null, null),
    ).resolves.toEqual({ objects: [], totalPage: 0 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photographer",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });

  it("getAllPhotographers sends every filter that is set", async () => {
    const requests = mockEndpoint("get", "*/photographer");

    await PhotographerApi.getAllPhotographers(
      10,
      1,
      "An",
      "desc",
      "asc",
      false,
      "desc",
    );

    expect(requests[0].query).toEqual({
      limit: "10",
      page: "1",
      search: "An",
      orderByPhotoCount: "desc",
      orderByVoteCount: "asc",
      isFollowed: "false",
      orderByFollower: "desc",
    });
  });

  it("getMyPhotos defaults to RAW photos", async () => {
    const requests = mockEndpoint("get", "*/photographer/me/photo", {
      objects: [{ id: "p1" }],
      totalPage: 1,
    });

    await expect(PhotographerApi.getMyPhotos(12, 0)).resolves.toEqual({
      objects: [{ id: "p1" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photographer/me/photo",
        query: { limit: "12", page: "0", photoType: "RAW" },
      }),
    ]);
  });

  it("getMyPhotos sends every filter that is set", async () => {
    const requests = mockEndpoint("get", "*/photographer/me/photo");

    await PhotographerApi.getMyPhotos(
      12,
      2,
      "desc",
      "asc",
      true,
      false,
      "Hoàng hôn",
      "BOOKING",
      ["BAN", "PARSED"],
      "desc",
    );

    expect(requests[0].query).toEqual({
      limit: "12",
      page: "2",
      photoType: "BOOKING",
      orderByCreatedAt: "desc",
      orderByUpvote: "asc",
      watermark: "true",
      selling: "false",
      title: "Hoàng hôn",
      statuses: "BAN",
      orderByUpdatedAt: "desc",
    });
  });

  it.each([
    ["no statuses", null],
    ["empty statuses", [] as string[]],
    ["blank status", [""]],
  ])("getMyPhotos skips unset filters (%s)", async (_case, statuses) => {
    const requests = mockEndpoint("get", "*/photographer/me/photo");

    await PhotographerApi.getMyPhotos(
      12,
      0,
      null,
      null,
      false,
      null,
      "",
      null,
      statuses,
      null,
    );

    expect(requests[0].query).toEqual({
      limit: "12",
      page: "0",
      photoType: "RAW",
    });
  });

  it("getPhotographerById returns the profile", async () => {
    const requests = mockEndpoint("get", "*/photographer/u1/profile", {
      id: "u1",
    });

    await expect(PhotographerApi.getPhotographerById("u1")).resolves.toEqual({
      id: "u1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photographer/u1/profile",
      }),
    ]);
  });
});
