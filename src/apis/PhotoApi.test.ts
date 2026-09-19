import { mockEndpoint } from "../test/mockEndpoint";
import PhotoApi from "./PhotoApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PhotoApi", () => {
  describe("getPublicPhotos", () => {
    it("sends only limit and page when no filter is set", async () => {
      const requests = mockEndpoint("get", "*/photo/public", {
        objects: [{ id: "p1" }],
        totalPage: 1,
      });

      await expect(PhotoApi.getPublicPhotos(10, 0)).resolves.toEqual({
        objects: [{ id: "p1" }],
        totalPage: 1,
      });
      expect(requests).toEqual([
        expect.objectContaining({
          method: "GET",
          path: "/photo/public",
          query: { limit: "10", page: "0" },
        }),
      ]);
    });

    it("sends every filter that is set", async () => {
      const requests = mockEndpoint("get", "*/photo/public");

      await PhotoApi.getPublicPhotos(
        20,
        1,
        "Phong cảnh",
        "desc",
        "asc",
        true,
        false,
        "biển",
        "u1",
        "cam1",
        true,
        ["tag1", "tag2"],
        false,
      );

      expect(requests[0].query).toEqual({
        limit: "20",
        page: "1",
        categoryName: "Phong cảnh",
        orderByCreatedAt: "desc",
        orderByUpvote: "asc",
        watermark: "true",
        selling: "false",
        search: "biển",
        photographerId: "u1",
        cameraId: "cam1",
        bookmarked: "true",
        tags: "tag1",
        isFollowed: "false",
      });
    });

    it.each([
      ["null", null, null, null, null],
      ["empty", false, [] as string[], "" as const, ""],
      ["blank tag", false, [""], undefined, undefined],
    ])(
      "skips unset filters (%s)",
      async (_case, watermark, tags, isFollowed, text) => {
        const requests = mockEndpoint("get", "*/photo/public");

        await PhotoApi.getPublicPhotos(
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
          null,
          tags,
          isFollowed,
        );

        expect(requests[0].query).toEqual({ limit: "10", page: "0" });
      },
    );
  });

  it("getPhotoTags asks for the top tags", async () => {
    const requests = mockEndpoint("get", "*/photo-tag", [{ tag: "biển" }]);

    await expect(PhotoApi.getPhotoTags({ top: 5 })).resolves.toEqual([
      { tag: "biển" },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photo-tag",
        query: { top: "5" },
      }),
    ]);
  });

  it("uploadPhoto posts the file as multipart", async () => {
    const requests = mockEndpoint("post", "*/photo/v2/upload", { id: "p1" });
    const file = new File(["img"], "raw.jpg", { type: "image/jpeg" });

    await expect(PhotoApi.uploadPhoto(file, vi.fn())).resolves.toEqual({
      id: "p1",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].path).toBe("/photo/v2/upload");
    expect((requests[0].form?.get("file") as File).name).toBe("raw.jpg");
  });

  it("updatePhotos patches the photo without its id and returns the whole response", async () => {
    const requests = mockEndpoint("patch", "*/photo/p1", { id: "p1" });

    const response = await PhotoApi.updatePhotos({
      id: "p1",
      title: "Hoàng hôn",
      categoryIds: ["cat1"],
      gps: { latitude: 10.77, longitude: 106.7 },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: "p1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/photo/p1",
        json: {
          title: "Hoàng hôn",
          categoryIds: ["cat1"],
          gps: { latitude: 10.77, longitude: 106.7 },
        },
      }),
    ]);
  });

  it("addWatermark posts the text and returns the whole response", async () => {
    const requests = mockEndpoint("post", "*/photo/p1/watermark", {
      id: "p1",
    });

    const response = await PhotoApi.addWatermark({
      photoId: "p1",
      text: "PurePixel",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: "p1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photo/p1/watermark",
        json: { text: "PurePixel" },
      }),
    ]);
  });

  it("deletePhoto deletes the photo and returns the whole response", async () => {
    const requests = mockEndpoint("delete", "*/photo/p1", true);

    const response = await PhotoApi.deletePhoto("p1");

    expect(response.status).toBe(200);
    expect(response.data).toBe(true);
    expect(requests).toEqual([
      expect.objectContaining({ method: "DELETE", path: "/photo/p1" }),
    ]);
  });

  it("getPhotoById returns the photo", async () => {
    const requests = mockEndpoint("get", "*/photo/p1", { id: "p1" });

    await expect(PhotoApi.getPhotoById("p1")).resolves.toEqual({ id: "p1" });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/photo/p1" }),
    ]);
  });

  it.each([
    ["getNextPublicById", PhotoApi.getNextPublicById, "true"],
    ["getPreviousPublicById", PhotoApi.getPreviousPublicById, "false"],
  ] as const)("%s walks from the cursor", async (_name, walk, forward) => {
    const requests = mockEndpoint("get", "*/photo/public/next", {
      objects: [{ id: "p2" }],
      totalPage: 1,
    });

    await expect(walk("p1")).resolves.toEqual({
      objects: [{ id: "p2" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photo/public/next",
        query: { cursor: "p1", forward },
      }),
    ]);
  });

  it("getPhotoComments returns the comments", async () => {
    const requests = mockEndpoint("get", "*/photo/p1/comment", [{ id: "c1" }]);

    await expect(PhotoApi.getPhotoComments("p1")).resolves.toEqual([
      { id: "c1" },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/photo/p1/comment" }),
    ]);
  });

  it.each([
    ["with a progress callback", vi.fn()],
    ["without a progress callback", undefined],
  ])("commentPhoto posts the content %s", async (_case, onProgress) => {
    const requests = mockEndpoint("post", "*/photo/p1/comment", { id: "c1" });

    await expect(
      PhotoApi.commentPhoto("p1", { content: "Đẹp" }, onProgress),
    ).resolves.toEqual({ id: "c1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photo/p1/comment",
        json: { content: "Đẹp" },
      }),
    ]);
  });

  it("getAvailableResolutionsByPhotoId returns the sizes", async () => {
    const requests = mockEndpoint("get", "*/photo/p1/available-resolution", [
      { width: 1920, height: 1080 },
    ]);

    await expect(
      PhotoApi.getAvailableResolutionsByPhotoId("p1"),
    ).resolves.toEqual([{ width: 1920, height: 1080 }]);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photo/p1/available-resolution",
      }),
    ]);
  });

  it("sharePhotoById posts the photo and size", async () => {
    const requests = mockEndpoint("post", "*/photo/share", {
      shareUrl: "https://share.test/p1",
    });

    await expect(
      PhotoApi.sharePhotoById("p1", { width: 1920, height: 1080 }),
    ).resolves.toEqual({ shareUrl: "https://share.test/p1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photo/share",
        json: { photoId: "p1", size: { width: 1920, height: 1080 } },
      }),
    ]);
  });
});
