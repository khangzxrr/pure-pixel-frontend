import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import ChatApi from "./ChatApi";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const message = {
  id: "m1",
  conversationId: "c1",
  senderId: "me",
  content: "hi",
  createdAt: "2026-09-05T00:00:00.000Z",
};

describe("ChatApi", () => {
  it("opens a conversation with a user", async () => {
    const direct = { id: "c1", otherUser: { id: "bob", name: "Bob", avatar: "b.png" } };
    const requests = mockEndpoint("post", "*/chat/conversations", direct);

    await expect(ChatApi.openConversation("bob")).resolves.toEqual(direct);
    expect(requests[0].json).toEqual({ userId: "bob" });
  });

  it("lists conversations with paging", async () => {
    const requests = mockEndpoint("get", "*/chat/conversations", []);

    await expect(ChatApi.getConversations()).resolves.toEqual([]);
    expect(requests[0].query).toEqual({ skip: "0", take: "20" });

    await ChatApi.getConversations(20, 10);
    expect(requests[1].query).toEqual({ skip: "20", take: "10" });
  });

  it("loads messages, with the beforeId cursor only when given", async () => {
    const requests = mockEndpoint("get", "*/chat/conversations/c1/messages", [message]);

    await expect(ChatApi.getMessages("c1")).resolves.toEqual([message]);
    expect(requests[0].query).toEqual({ take: "30" });

    await ChatApi.getMessages("c1", { beforeId: "m0", take: 10 });
    expect(requests[1].query).toEqual({ take: "10", beforeId: "m0" });
  });

  it("sends a message", async () => {
    const requests = mockEndpoint("post", "*/chat/conversations/c1/messages", message);

    await expect(ChatApi.sendMessage("c1", "hi")).resolves.toEqual(message);
    expect(requests[0].json).toEqual({ content: "hi" });
  });

  it("marks a conversation as read", async () => {
    const requests = mockEndpoint("post", "*/chat/conversations/c1/read", {});

    await ChatApi.markAsRead("c1");
    expect(requests).toHaveLength(1);
  });

  it("returns the unread count", async () => {
    mockEndpoint("get", "*/chat/unread-count", { count: 4 });
    await expect(ChatApi.getUnreadCount()).resolves.toBe(4);
  });

  it("rejects on server errors", async () => {
    mockEndpoint(
      "post",
      "*/chat/conversations/c1/messages",
      () => new HttpResponse(null, { status: 403 }),
    );
    await expect(ChatApi.sendMessage("c1", "hi")).rejects.toMatchObject({
      response: { status: 403 },
    });
  });
});
