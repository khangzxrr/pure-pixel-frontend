import { mockEndpoint } from "../test/mockEndpoint";
import CameraApi from "./CameraApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CameraApi", () => {
  it("getTopCameras asks for the top brands", async () => {
    const requests = mockEndpoint("get", "*/camera/brand/popular", [
      { maker: { id: "m1" } },
    ]);

    await expect(CameraApi.getTopCameras(10)).resolves.toEqual([
      { maker: { id: "m1" } },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/camera/brand/popular",
        query: { top: "10" },
      }),
    ]);
  });

  it("getTopCamerasByBrandId asks for the top cameras of a brand", async () => {
    const requests = mockEndpoint("get", "*/camera/brand/m1/top", [
      { id: "c1" },
    ]);

    await expect(CameraApi.getTopCamerasByBrandId("m1", 5)).resolves.toEqual([
      { id: "c1" },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/camera/brand/m1/top",
        query: { top: "5" },
      }),
    ]);
  });

  it("getCameraChart returns the popularity timeline", async () => {
    const requests = mockEndpoint("get", "*/camera/popular-graph", [
      { timestamp: "2024-10-19" },
    ]);

    await expect(CameraApi.getCameraChart()).resolves.toEqual([
      { timestamp: "2024-10-19" },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/camera/popular-graph" }),
    ]);
  });

  it("getCameraById returns the camera", async () => {
    const requests = mockEndpoint("get", "*/camera/c1", { id: "c1" });

    await expect(CameraApi.getCameraById("c1")).resolves.toEqual({ id: "c1" });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/camera/c1" }),
    ]);
  });
});
