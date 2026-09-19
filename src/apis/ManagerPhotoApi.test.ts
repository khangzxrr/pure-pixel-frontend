import { mockEndpoint } from "../test/mockEndpoint";
import ManagerPhotoApi from "./ManagerPhotoApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("ManagerPhotoApi", () => {
  it("getAllPhotos sends only limit and page when no filter is set", async () => {
    const requests = mockEndpoint("get", "*/manager/photo", {
      objects: [],
      totalPage: 0,
    });

    await expect(ManagerPhotoApi.getAllPhotos(10, 0)).resolves.toEqual({
      objects: [],
      totalPage: 0,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/manager/photo",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });

  it("getAllPhotos sends every filter that is set", async () => {
    const requests = mockEndpoint("get", "*/manager/photo");

    await ManagerPhotoApi.getAllPhotos(
      20,
      3,
      "Phong cảnh",
      "desc",
      "asc",
      true,
      false,
      "An",
      "Hoàng hôn",
      "u1",
      "cam1",
      false,
      ["tag1", "tag2"],
      true,
    );

    expect(requests[0].query).toEqual({
      limit: "20",
      page: "3",
      categoryName: "Phong cảnh",
      orderByCreatedAt: "desc",
      orderByUpvote: "asc",
      watermark: "true",
      selling: "false",
      photographerName: "An",
      title: "Hoàng hôn",
      photographerId: "u1",
      cameraId: "cam1",
      bookmarked: "false",
      tags: "tag1",
      isFollowed: "true",
    });
  });

  it.each([
    ["null", null, null, null, null],
    ["empty", false, [] as string[], "" as const, ""],
    ["blank tag", false, [""], undefined, undefined],
  ])(
    "getAllPhotos skips unset filters (%s)",
    async (_case, watermark, tags, isFollowed, text) => {
      const requests = mockEndpoint("get", "*/manager/photo");

      await ManagerPhotoApi.getAllPhotos(
        10,
        0,
        text,
        null,
        null,
        watermark,
        null,
        text,
        text,
        text,
        text,
        null,
        tags,
        isFollowed,
      );

      expect(requests[0].query).toEqual({ limit: "10", page: "0" });
    },
  );

  it("deletePhoto deletes the photo", async () => {
    const requests = mockEndpoint("delete", "*/manager/photo/p1", { id: "p1" });

    await expect(ManagerPhotoApi.deletePhoto("p1")).resolves.toEqual({
      id: "p1",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "DELETE", path: "/manager/photo/p1" }),
    ]);
  });

  it("updatePhoto patches the photo", async () => {
    const requests = mockEndpoint("patch", "*/manager/photo/p1", {
      id: "p1",
      title: "Mới",
    });

    await expect(
      ManagerPhotoApi.updatePhoto("p1", { title: "Mới", visibility: "PRIVATE" }),
    ).resolves.toEqual({ id: "p1", title: "Mới" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/manager/photo/p1",
        json: { title: "Mới", visibility: "PRIVATE" },
      }),
    ]);
  });

  it.each([
    ["banPhoto", ManagerPhotoApi.banPhoto, "/manager/photo/p1/ban"],
    ["unBanPhoto", ManagerPhotoApi.unBanPhoto, "/manager/photo/p1/unban"],
  ] as const)("%s posts to %s", async (_name, action, path) => {
    const requests = mockEndpoint("post", `*${path}`, true);

    await expect(action("p1")).resolves.toBe(true);
    expect(requests).toEqual([expect.objectContaining({ method: "POST", path })]);
  });
});
