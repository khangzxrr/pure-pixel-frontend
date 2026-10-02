import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import FeatureFlagApi from "./FeatureFlagApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("FeatureFlagApi", () => {
  it("returns the flags", async () => {
    mockEndpoint("get", "*/feature-flags", { booking: false });
    await expect(FeatureFlagApi.getFeatureFlags()).resolves.toEqual({ booking: false });
  });

  it("rejects on server errors", async () => {
    mockEndpoint("get", "*/feature-flags", () => new HttpResponse(null, { status: 500 }));
    await expect(FeatureFlagApi.getFeatureFlags()).rejects.toMatchObject({
      response: { status: 500 },
    });
  });
});
