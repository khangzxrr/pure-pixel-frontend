import { mockEndpoint } from "../test/mockEndpoint";
import NewsfeedApi from "./NewsfeedApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("NewsfeedApi", () => {
  it("getAllNewsfeed pages through the newsfeed", async () => {
    const requests = mockEndpoint("get", "*/newsfeed", {
      objects: [{ id: "n1" }],
      totalPage: 1,
    });

    await expect(NewsfeedApi.getAllNewsfeed(5, 1)).resolves.toEqual({
      objects: [{ id: "n1" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/newsfeed",
        query: { limit: "5", page: "1" },
      }),
    ]);
  });
});
