import { mockEndpoint } from "../test/mockEndpoint";
import UserApi from "./UserApi";

const loadUserProfile = vi.hoisted(() => vi.fn());

vi.mock("../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    keycloakService: { loadUserProfile },
  },
}));

describe("UserApi", () => {
  it("getKeycloakProfile loads the profile from Keycloak", async () => {
    loadUserProfile.mockResolvedValue({ username: "an" });

    await expect(UserApi.getKeycloakProfile()).resolves.toEqual({
      username: "an",
    });
    expect(loadUserProfile).toHaveBeenCalledTimes(1);
  });

  it("getApplicationProfile returns my profile", async () => {
    const requests = mockEndpoint("get", "*/me", { id: "u1", name: "An" });

    await expect(UserApi.getApplicationProfile()).resolves.toEqual({
      id: "u1",
      name: "An",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/me" }),
    ]);
  });

  it("reportByUser posts the report", async () => {
    const requests = mockEndpoint("post", "*/user/report", { id: "r1" });
    const report = {
      content: "Không đến buổi chụp",
      reportType: "BOOKING" as const,
      referenceId: "b1",
    };

    await expect(UserApi.reportByUser(report)).resolves.toEqual({ id: "r1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/user/report",
        json: report,
      }),
    ]);
  });
});
