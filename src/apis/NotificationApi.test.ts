import { mockEndpoint } from "../test/mockEndpoint";
import NotificationApi from "./NotificationApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("NotificationApi", () => {
  it("getAllNotifactions pages through my notifications", async () => {
    const requests = mockEndpoint("get", "*/notification", {
      objects: [{ id: "noti1" }],
      totalPage: 2,
    });

    await expect(NotificationApi.getAllNotifactions(10, 0)).resolves.toEqual({
      objects: [{ id: "noti1" }],
      totalPage: 2,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/notification",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });
});
