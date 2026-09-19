import { render, screen } from "@testing-library/react";
import ChatPage from "./ChatPage";

const navigateMock = vi.hoisted(() => vi.fn());
const chatContext = vi.hoisted(() => ({
  client: null as null | { channel: ReturnType<typeof vi.fn> },
  setActiveChannel: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams(window.location.search)],
  };
});

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: { tokenParsed: { sub: "me-1" } },
  }),
}));

vi.mock("stream-chat-react", () => ({
  useChatContext: () => chatContext,
  ChannelList: ({ filters }: { filters: Record<string, unknown> }) => (
    <div data-testid="channel-list">{JSON.stringify(filters)}</div>
  ),
  Channel: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ChannelHeader: () => <div>header</div>,
  MessageInput: () => <div>message input</div>,
  MessageList: () => <div>message list</div>,
  Window: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const setSearch = (search: string) => {
  window.history.pushState({}, "", `/chat${search}`);
};

describe("ChatPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    chatContext.client = null;
    chatContext.setActiveChannel.mockReset();
    setSearch("");
  });

  it("shows a loading message while the chat client is not ready", () => {
    render(<ChatPage />);
    expect(screen.getByText("loading chat...")).toBeInTheDocument();
  });

  it("renders the channel list and message window once the client is ready", () => {
    chatContext.client = { channel: vi.fn() };

    render(<ChatPage />);

    expect(screen.getByTestId("channel-list")).toHaveTextContent(
      '"members":{"$in":["me-1"]}',
    );
    expect(screen.getByText("header")).toBeInTheDocument();
    expect(screen.getByText("message list")).toBeInTheDocument();
    expect(screen.getByText("message input")).toBeInTheDocument();
  });

  it("opens a direct channel with the target user from the query string", () => {
    setSearch("?to=other-user");
    const channelMock = vi.fn().mockReturnValue({ id: "channel-1" });
    chatContext.client = { channel: channelMock };

    render(<ChatPage />);

    expect(channelMock).toHaveBeenCalledWith("messaging", {
      members: ["me-1", "other-user"],
    });
    expect(chatContext.setActiveChannel).toHaveBeenCalledWith({
      id: "channel-1",
    });
  });

  it("navigates back when the target user is the signed in user", () => {
    setSearch("?to=me-1");
    chatContext.client = { channel: vi.fn() };

    render(<ChatPage />);

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
