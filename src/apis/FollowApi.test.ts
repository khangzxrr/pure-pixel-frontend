import { mockEndpoint } from "../test/mockEndpoint";
import FollowApi from "./FollowApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("FollowApi", () => {
  it.each([
    ["followPhotographer", FollowApi.followPhotographer],
    ["followUser", FollowApi.followUser],
  ] as const)("%s follows the user", async (_name, follow) => {
    const requests = mockEndpoint("post", "*/follow/me/following/u2", {
      followingId: "u2",
    });

    await expect(follow("u2")).resolves.toEqual({ followingId: "u2" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/follow/me/following/u2",
      }),
    ]);
  });

  it("getAllFolllowerMe pages through my followers", async () => {
    const requests = mockEndpoint("get", "*/follow/me/follower", {
      objects: [],
      totalPage: 0,
    });

    await expect(FollowApi.getAllFolllowerMe(10, 1)).resolves.toEqual({
      objects: [],
      totalPage: 0,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/follow/me/follower",
        query: { limit: "10", page: "1" },
      }),
    ]);
  });

  it("getAllFollowingMe pages through the users I follow", async () => {
    const requests = mockEndpoint("get", "*/follow/me/following", {
      objects: [{ followingId: "u2" }],
      totalPage: 1,
    });

    await expect(FollowApi.getAllFollowingMe(10, 0)).resolves.toEqual({
      objects: [{ followingId: "u2" }],
      totalPage: 1,
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/follow/me/following",
        query: { limit: "10", page: "0" },
      }),
    ]);
  });

  it("unFollow deletes the follow", async () => {
    const requests = mockEndpoint("delete", "*/follow/me/following/u2", {
      followingId: "u2",
    });

    await expect(FollowApi.unFollow("u2")).resolves.toEqual({
      followingId: "u2",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "DELETE",
        path: "/follow/me/following/u2",
      }),
    ]);
  });

  it("getUserFollower requests the follower route of a user", async () => {
    const requests = mockEndpoint("get", "*/follow/me/follower/u2", {
      followerId: "u2",
    });

    await expect(FollowApi.getUserFollower("u2")).resolves.toEqual({
      followerId: "u2",
    });
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/follow/me/follower/u2" }),
    ]);
  });

  it("getUserFollowing checks whether I follow a user", async () => {
    const requests = mockEndpoint("get", "*/follow/me/following/u2", {
      followingId: "u2",
    });

    await expect(FollowApi.getUserFollowing("u2")).resolves.toEqual({
      followingId: "u2",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/follow/me/following/u2",
      }),
    ]);
  });
});
