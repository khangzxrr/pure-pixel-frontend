import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { ChatMessage, Conversation } from "../../apis/ChatApi";
import ChatProvider from "../../components/ChatComponent/ChatProvider";
import { mockEndpoint } from "../../test/mockEndpoint";
import { renderWithProviders } from "../../test/render";
import ChatPage from "./ChatPage";

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    initialized: true,
    keycloak: { authenticated: true, token: "tok", tokenParsed: { sub: "me" } },
  }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

type Handler = (...args: unknown[]) => void;
const socketMock = vi.hoisted(() => {
  const handlers: Record<string, Handler[]> = {};
  const socket = {
    auth: {},
    on: vi.fn((event: string, handler: Handler) => {
      (handlers[event] ??= []).push(handler);
      return socket;
    }),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  const fire = (event: string, ...args: unknown[]) =>
    (handlers[event] ?? []).forEach((handler) => handler(...args));
  const reset = () => Object.keys(handlers).forEach((key) => delete handlers[key]);
  return { socket, fire, reset, io: vi.fn(() => socket) };
});

vi.mock("socket.io-client", () => ({ io: socketMock.io, default: socketMock.io }));

const bob = { id: "bob", name: "Bob Trần", avatar: "bob.png" };
const ann = { id: "ann", name: "Ann Lê", avatar: "ann.png" };

const msg = (
  id: string,
  conversationId: string,
  senderId: string,
  content: string,
  createdAt = "2026-09-05T00:00:00.000Z",
): ChatMessage => ({ id, conversationId, senderId, content, createdAt });

const conversation = (
  id: string,
  otherUser: typeof bob,
  lastMessage: ChatMessage | null,
  unreadCount = 0,
): Conversation => ({
  id,
  otherUser,
  lastMessage,
  unreadCount,
  lastMessageAt: lastMessage?.createdAt ?? "2026-09-01T00:00:00.000Z",
});

const renderChat = (route = "/message") =>
  renderWithProviders(
    <ChatProvider>
      <ChatPage />
    </ChatProvider>,
    { route, path: "/message" },
  );

const conversationList = () => screen.findByRole("list", { name: "Cuộc trò chuyện" });
const messageList = () => screen.findByRole("list", { name: "Tin nhắn" });

describe("ChatPage", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    socketMock.reset();
  });

  it("shows the empty state when there are no conversations", async () => {
    mockEndpoint("get", "*/chat/conversations", []);
    renderChat();

    expect(await screen.findByText("Chưa có cuộc trò chuyện nào")).toBeInTheDocument();
    expect(screen.getByText("Chọn một cuộc trò chuyện để bắt đầu")).toBeInTheDocument();
  });

  it("lists conversations with last message and unread badge, and opens one", async () => {
    mockEndpoint("get", "*/chat/conversations", [
      conversation("c1", bob, msg("m2", "c1", "bob", "Hẹn chụp thứ bảy nhé"), 2),
      conversation("c2", ann, msg("m5", "c2", "me", "Cảm ơn chị")),
    ]);
    const history = mockEndpoint("get", "*/chat/conversations/c1/messages", [
      msg("m1", "c1", "me", "Chào anh", "2026-09-04T00:00:00.000Z"),
      msg("m2", "c1", "bob", "Hẹn chụp thứ bảy nhé"),
    ]);
    const reads = mockEndpoint("post", "*/chat/conversations/c1/read", {});
    renderChat();

    const list = await conversationList();
    const bobItem = within(list).getByRole("button", { name: /Bob Trần/ });
    expect(bobItem).toHaveTextContent("Hẹn chụp thứ bảy nhé");
    expect(within(bobItem).getByLabelText("2 tin nhắn chưa đọc")).toHaveTextContent("2");
    expect(within(list).getByRole("button", { name: /Ann Lê/ })).toHaveTextContent("Cảm ơn chị");

    await userEvent.click(bobItem);

    expect(await screen.findByRole("heading", { level: 2, name: "Bob Trần" })).toBeInTheDocument();
    const items = within(await messageList()).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Chào anh"),
      expect.stringContaining("Hẹn chụp thứ bảy nhé"),
    ]);
    expect(items[0]).toHaveAttribute("data-own", "true");
    expect(items[1]).toHaveAttribute("data-own", "false");
    expect(history[0].query.take).toBe("30");
    await waitFor(() => expect(reads).toHaveLength(1));
    await waitFor(() =>
      expect(within(bobItem).queryByLabelText("2 tin nhắn chưa đọc")).not.toBeInTheDocument(),
    );
    expect(bobItem).toHaveAttribute("aria-current", "true");
  });

  it("opens the conversation from ?to even before it has messages", async () => {
    mockEndpoint("get", "*/chat/conversations", []);
    const opened = mockEndpoint("post", "*/chat/conversations", { id: "c7", otherUser: bob });
    mockEndpoint("get", "*/chat/conversations/c7/messages", []);
    mockEndpoint("post", "*/chat/conversations/c7/read", {});
    renderChat("/message?to=bob");

    expect(await screen.findByRole("heading", { level: 2, name: "Bob Trần" })).toBeInTheDocument();
    expect(opened[0].json).toEqual({ userId: "bob" });
    expect(screen.getByPlaceholderText("Nhập tin nhắn...")).toBeInTheDocument();
  });

  it("goes back instead of chatting with yourself", async () => {
    mockEndpoint("get", "*/chat/conversations", []);
    const opened = mockEndpoint("post", "*/chat/conversations", {});
    renderChat("/message?to=me");

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(-1));
    expect(opened).toHaveLength(0);
  });

  describe("with an open conversation", () => {
    beforeEach(() => {
      mockEndpoint("get", "*/chat/conversations", [
        conversation("c1", bob, msg("m1", "c1", "bob", "Chào em")),
        conversation("c2", ann, msg("m5", "c2", "ann", "Ảnh đẹp quá")),
      ]);
      mockEndpoint("post", "*/chat/conversations", { id: "c1", otherUser: bob });
      mockEndpoint("get", "*/chat/conversations/c1/messages", [msg("m1", "c1", "bob", "Chào em")]);
      mockEndpoint("post", "*/chat/conversations/c1/read", {});
    });

    it("sends with Enter, clears the box and shows the message once", async () => {
      const sent = mockEndpoint("post", "*/chat/conversations/c1/messages", msg("m9", "c1", "me", "Dạ em chào anh"));
      renderChat("/message?to=bob");

      const box = await screen.findByPlaceholderText("Nhập tin nhắn...");
      const send = screen.getByRole("button", { name: "Gửi" });
      expect(send).toBeDisabled();
      await userEvent.type(box, "   ");
      expect(send).toBeDisabled();

      await userEvent.clear(box);
      await userEvent.type(box, "Dạ em chào anh{Enter}");

      await waitFor(() => expect(sent).toHaveLength(1));
      expect(sent[0].json).toEqual({ content: "Dạ em chào anh" });
      const list = await messageList();
      await within(list).findByText("Dạ em chào anh");
      expect(box).toHaveValue("");

      // the server echoes the sender's own message over the socket too
      act(() => socketMock.fire("chat-message", msg("m9", "c1", "me", "Dạ em chào anh")));
      expect(within(list).getAllByText("Dạ em chào anh")).toHaveLength(1);
    });

    it("inserts a newline with Shift+Enter instead of sending", async () => {
      const sent = mockEndpoint("post", "*/chat/conversations/c1/messages", {});
      renderChat("/message?to=bob");

      const box = await screen.findByPlaceholderText("Nhập tin nhắn...");
      await userEvent.type(box, "dòng 1{Shift>}{Enter}{/Shift}dòng 2");

      expect(box).toHaveValue("dòng 1\ndòng 2");
      expect(sent).toHaveLength(0);
    });

    it("keeps the text and shows an error when sending fails", async () => {
      mockEndpoint("post", "*/chat/conversations/c1/messages", () => new HttpResponse(null, { status: 500 }));
      renderChat("/message?to=bob");

      const box = await screen.findByPlaceholderText("Nhập tin nhắn...");
      await userEvent.type(box, "Alo");
      await userEvent.click(screen.getByRole("button", { name: "Gửi" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Không gửi được tin nhắn");
      expect(box).toHaveValue("Alo");
    });

    it("appends pushed messages for the open conversation and marks them read", async () => {
      const reads = mockEndpoint("post", "*/chat/conversations/c1/read", {});
      renderChat("/message?to=bob");
      const list = await messageList();
      await within(list).findByText("Chào em");
      await waitFor(() => expect(reads.length).toBeGreaterThan(0));
      const readsBefore = reads.length;

      act(() => socketMock.fire("chat-message", msg("m2", "c1", "bob", "Em rảnh không?")));

      expect(await within(list).findByText("Em rảnh không?")).toBeInTheDocument();
      await waitFor(() => expect(reads.length).toBeGreaterThan(readsBefore));
    });

    it("updates another conversation's preview and unread badge and moves it to the top", async () => {
      renderChat("/message?to=bob");
      const list = await conversationList();
      await within(list).findByRole("button", { name: /Ann Lê/ });

      act(() => socketMock.fire("chat-message", msg("m6", "c2", "ann", "Mai gặp nhé")));

      const annItem = await within(list).findByRole("button", { name: /Ann Lê/ });
      await waitFor(() => expect(annItem).toHaveTextContent("Mai gặp nhé"));
      expect(within(annItem).getByLabelText("1 tin nhắn chưa đọc")).toBeInTheDocument();
      const order = within(list).getAllByRole("button").map((button) => button.textContent);
      expect(order[0]).toContain("Ann Lê");
    });
  });

  it("shows the conversation opened last when an earlier load answers later", async () => {
    mockEndpoint("get", "*/chat/conversations", [
      conversation("c1", bob, msg("m1", "c1", "bob", "Tin của Bob")),
      conversation("c2", ann, msg("m5", "c2", "ann", "Tin của Ann")),
    ]);
    mockEndpoint("post", "*/chat/conversations/:id/read", {});
    let releaseBob: () => void = () => undefined;
    const bobAnswered = new Promise<void>((resolve) => (releaseBob = resolve));
    mockEndpoint("get", "*/chat/conversations/c1/messages", async () => {
      await bobAnswered;
      return HttpResponse.json([msg("m1", "c1", "bob", "Lịch sử của Bob")]);
    });
    mockEndpoint("get", "*/chat/conversations/c2/messages", [
      msg("m5", "c2", "ann", "Lịch sử của Ann"),
    ]);
    renderChat();

    const list = await conversationList();
    await userEvent.click(within(list).getByRole("button", { name: /Bob Trần/ }));
    await userEvent.click(within(list).getByRole("button", { name: /Ann Lê/ }));
    const messages = await messageList();
    await within(messages).findByText("Lịch sử của Ann");

    releaseBob();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByRole("heading", { level: 2, name: "Ann Lê" })).toBeInTheDocument();
    expect(within(messages).queryByText("Lịch sử của Bob")).not.toBeInTheDocument();
  });

  it("loads more conversations when a full page was returned", async () => {
    const people = Array.from({ length: 21 }, (_, i) => ({
      id: `u${i}`,
      name: `Người ${i}`,
      avatar: `${i}.png`,
    }));
    const all = people.map((person, i) =>
      conversation(`c${i}`, person, msg(`m${i}`, `c${i}`, person.id, `chào ${i}`)),
    );
    const pages = mockEndpoint("get", "*/chat/conversations", () =>
      HttpResponse.json(pages.length === 1 ? all.slice(0, 20) : all.slice(20)),
    );
    renderChat();

    const list = await conversationList();
    await within(list).findByRole("button", { name: /Người 19/ });
    await userEvent.click(screen.getByRole("button", { name: "Tải thêm cuộc trò chuyện" }));

    expect(await within(list).findByRole("button", { name: /Người 20/ })).toBeInTheDocument();
    expect(pages[1].query).toEqual({ skip: "20", take: "20" });
    expect(within(list).getAllByRole("button")).toHaveLength(21);
    expect(screen.queryByRole("button", { name: "Tải thêm cuộc trò chuyện" })).not.toBeInTheDocument();
  });

  it("loads older messages when a full page was returned", async () => {
    const page = Array.from({ length: 30 }, (_, i) =>
      msg(`n${i}`, "c1", "bob", `tin ${i}`, new Date(Date.UTC(2026, 8, 5, 0, i)).toISOString()),
    );
    mockEndpoint("get", "*/chat/conversations", [conversation("c1", bob, page[29])]);
    mockEndpoint("post", "*/chat/conversations", { id: "c1", otherUser: bob });
    mockEndpoint("post", "*/chat/conversations/c1/read", {});
    const history = mockEndpoint("get", "*/chat/conversations/c1/messages", () =>
      HttpResponse.json(history.length === 1 ? page : [msg("old", "c1", "me", "tin cũ nhất", "2026-09-04T00:00:00.000Z")]),
    );
    renderChat("/message?to=bob");

    const list = await messageList();
    await within(list).findByText("tin 29");
    await userEvent.click(screen.getByRole("button", { name: "Tải tin nhắn cũ hơn" }));

    expect(await within(list).findByText("tin cũ nhất")).toBeInTheDocument();
    expect(history[1].query.beforeId).toBe(page[0].id);
    expect(within(list).getAllByRole("listitem")[0]).toHaveTextContent("tin cũ nhất");
    expect(screen.queryByRole("button", { name: "Tải tin nhắn cũ hơn" })).not.toBeInTheDocument();
  });
});
