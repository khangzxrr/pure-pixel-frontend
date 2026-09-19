import { mockEndpoint } from "../test/mockEndpoint";
import CommentApi from "./CommentApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CommentApi", () => {
  it("getComments returns the comments of a photo", async () => {
    const requests = mockEndpoint("get", "*/comment/photo/p1", [{ id: "c1" }]);

    await expect(CommentApi.getComments("p1")).resolves.toEqual([{ id: "c1" }]);
    expect(requests).toEqual([
      expect.objectContaining({ method: "GET", path: "/comment/photo/p1" }),
    ]);
  });

  it("addComment posts the content", async () => {
    const requests = mockEndpoint("post", "*/comment/photo/p1", { id: "c1" });

    await expect(CommentApi.addComment("p1", "Đẹp quá")).resolves.toEqual({
      id: "c1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/comment/photo/p1",
        json: { content: "Đẹp quá" },
      }),
    ]);
  });

  it("getCommentReplies returns the replies of a comment", async () => {
    const requests = mockEndpoint("get", "*/comment/photo/p1/comment/c1", [
      { id: "r1" },
    ]);

    await expect(CommentApi.getCommentReplies("p1", "c1")).resolves.toEqual([
      { id: "r1" },
    ]);
    expect(requests).toEqual([
      expect.objectContaining({
        method: "GET",
        path: "/comment/photo/p1/comment/c1",
      }),
    ]);
  });

  it("updateComment patches the content", async () => {
    const requests = mockEndpoint("patch", "*/comment/photo/p1/comment/c1", {
      id: "c1",
    });

    await expect(
      CommentApi.updateComment("p1", "c1", "Sửa lại"),
    ).resolves.toEqual({ id: "c1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "PATCH",
        path: "/comment/photo/p1/comment/c1",
        json: { content: "Sửa lại" },
      }),
    ]);
  });

  it("deleteComment deletes the comment", async () => {
    const requests = mockEndpoint("delete", "*/comment/photo/p1/comment/c1", {
      id: "c1",
    });

    await expect(CommentApi.deleteComment("p1", "c1")).resolves.toEqual({
      id: "c1",
    });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "DELETE",
        path: "/comment/photo/p1/comment/c1",
      }),
    ]);
  });

  it("replyToComment posts the reply content", async () => {
    const requests = mockEndpoint(
      "post",
      "*/comment/photo/p1/comment/c1/reply",
      { id: "r1" },
    );

    await expect(
      CommentApi.replyToComment("p1", "c1", "Cảm ơn"),
    ).resolves.toEqual({ id: "r1" });
    expect(requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/comment/photo/p1/comment/c1/reply",
        json: { content: "Cảm ơn" },
      }),
    ]);
  });
});
