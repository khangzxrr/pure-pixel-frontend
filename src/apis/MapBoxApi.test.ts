import { mockEndpoint } from "../test/mockEndpoint";
import MapBoxApi from "./MapBoxApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const geocode = {
  features: [{ properties: { full_address: "Quận 1, Hồ Chí Minh" } }],
};

describe("MapBoxApi", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MAPBOX_TOKEN", "pk.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("getAddressByCoordinate reverse geocodes one Vietnamese place", async () => {
    const requests = mockEndpoint(
      "get",
      "https://api.mapbox.com/search/geocode/v6/reverse",
      geocode,
    );

    await expect(
      MapBoxApi.getAddressByCoordinate(106.7, 10.77),
    ).resolves.toEqual(geocode);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        query: {
          longitude: "106.7",
          latitude: "10.77",
          types: "place",
          language: "vi",
          limit: "1",
          access_token: "pk.test",
        },
      }),
    ]);
  });

  it("getCoordinateByAddress forward geocodes the encoded address in Vietnam", async () => {
    const requests = mockEndpoint(
      "get",
      "https://api.mapbox.com/search/geocode/v6/forward",
      geocode,
    );

    await expect(
      MapBoxApi.getCoordinateByAddress("Quận 1 & Quận 3"),
    ).resolves.toEqual(geocode);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        query: {
          q: "Quận 1 & Quận 3",
          country: "VN",
          access_token: "pk.test",
        },
      }),
    ]);
  });

  it("getPhotoListByCoorddinate asks the backend for public photos near a point", async () => {
    const requests = mockEndpoint("get", "*/photo/public", {
      objects: [{ id: "p1" }],
      totalPage: 1,
    });

    await expect(
      MapBoxApi.getPhotoListByCoorddinate(0, 30, 106.7, 10.77, 5),
    ).resolves.toEqual({ objects: [{ id: "p1" }], totalPage: 1 });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/photo/public",
        query: {
          limit: "30",
          page: "0",
          gps: "true",
          longitude: "106.7",
          latitude: "10.77",
          distance: "5",
          selling: "false",
        },
      }),
    ]);
  });
});
