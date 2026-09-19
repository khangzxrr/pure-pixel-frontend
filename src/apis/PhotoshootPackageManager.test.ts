import { mockEndpoint } from "../test/mockEndpoint";
import { PhotoshootPackageManager } from "./PhotoshootPackageManager";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PhotoshootPackageManager", () => {
  it.each([
    [
      "disablePhotoshootPackage",
      PhotoshootPackageManager.disablePhotoshootPackage,
      "/manager/photoshoot-package/pk1/disable",
    ],
    [
      "enablePhotoshootPackage",
      PhotoshootPackageManager.enablePhotoshootPackage,
      "/manager/photoshoot-package/pk1/enable",
    ],
  ] as const)("%s posts to %s", async (_name, action, path) => {
    const requests = mockEndpoint("post", `*${path}`, true);

    await expect(action("pk1")).resolves.toBe(true);
    expect(requests).toEqual([expect.objectContaining({ method: "POST", path })]);
  });
});
