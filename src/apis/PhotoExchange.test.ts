import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import PhotoExchange from "./PhotoExchange";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PhotoExchange", () => {
  it("getPhotoBought sends the sort order when given", async () => {
    const requests = mockEndpoint("get", "*/photo-exchange/me/photo-buy", {
      objects: [],
      totalPage: 0,
    });

    await expect(PhotoExchange.getPhotoBought(12, 1, "desc")).resolves.toEqual(
      { objects: [], totalPage: 0 },
    );
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photo-exchange/me/photo-buy",
        query: { limit: "12", page: "1", orderByUpdatedAt: "desc" },
      }),
    ]);
  });

  it("getPhotoBought omits the sort order when missing", async () => {
    const requests = mockEndpoint("get", "*/photo-exchange/me/photo-buy");

    await PhotoExchange.getPhotoBought(12, 0);

    expect(requests[0].query).toEqual({ limit: "12", page: "0" });
  });

  it("getPhotoBoughtDetail returns the bought photo", async () => {
    const requests = mockEndpoint("get", "*/photo/p1/photo-buy", {
      photoBuys: [],
    });

    await expect(PhotoExchange.getPhotoBoughtDetail("p1")).resolves.toEqual({
      photoBuys: [],
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/photo/p1/photo-buy" }),
    ]);
  });

  it("getPhotoBoughtDetailDownload returns the file as a blob", async () => {
    const requests = mockEndpoint(
      "get",
      "*/photo/p1/photo-buy/b1/download",
      () => HttpResponse.text("image-bytes"),
    );

    const file = await PhotoExchange.getPhotoBoughtDetailDownload("p1", "b1");

    expect(file).toBeInstanceOf(Blob);
    expect(file.size).toBe("image-bytes".length);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photo/p1/photo-buy/b1/download",
      }),
    ]);
  });

  it("sellPhotoByPhotoId posts the price tags without the id", async () => {
    const requests = mockEndpoint("post", "*/photo/p1/sell", { id: "sell1" });
    const pricetags = [{ width: 1920, height: 1080, price: 50000 }];

    await expect(
      PhotoExchange.sellPhotoByPhotoId({ id: "p1", pricetags }),
    ).resolves.toEqual({ id: "sell1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/photo/p1/sell",
        json: { pricetags },
      }),
    ]);
  });
});
