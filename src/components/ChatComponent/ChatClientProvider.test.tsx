import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ChatApi from "../../apis/ChatApi";
import ChatClientProvider, { chatTokenProvider } from "./ChatClientProvider";

const chat = vi.hoisted(() => ({ useCreateChatClient: vi.fn() }));

vi.mock("stream-chat-react", () => ({
  useCreateChatClient: chat.useCreateChatClient,
  Chat: ({
    children,
    client,
    theme,
  }: {
    children?: ReactNode;
    client: { id: string };
    theme?: string;
  }) => (
    <div data-testid="chat" data-client={client.id} data-theme={theme}>
      {children}
    </div>
  ),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("ChatClientProvider", () => {
  afterEach(() => {
    chat.useCreateChatClient.mockReset();
  });

  it("creates the client with the API key, token provider and user id", () => {
    chat.useCreateChatClient.mockReturnValue(null);

    render(
      <ChatClientProvider user={{ id: "user-1", name: "Minh" }}>
        <span>app</span>
      </ChatClientProvider>,
    );

    expect(chat.useCreateChatClient).toHaveBeenCalledWith({
      apiKey: import.meta.env.VITE_STREAM_API_KEY,
      tokenOrProvider: chatTokenProvider,
      userData: { id: "user-1" },
    });
  });

  it("provides the chat token from the backend", async () => {
    const auth = vi.spyOn(ChatApi, "auth").mockResolvedValue("chat-token");
    await expect(chatTokenProvider()).resolves.toBe("chat-token");
    auth.mockRestore();
  });

  it("rejects when the backend gave no token", async () => {
    const auth = vi.spyOn(ChatApi, "auth").mockResolvedValue(undefined);
    await expect(chatTokenProvider()).rejects.toThrow("Chat token unavailable");
    auth.mockRestore();
  });

  it("renders the children without chat until the client is connected", () => {
    chat.useCreateChatClient.mockReturnValue(null);

    render(
      <ChatClientProvider user={{ id: "user-1" }}>
        <span>app</span>
      </ChatClientProvider>,
    );

    expect(screen.getByText("app")).toBeInTheDocument();
    expect(screen.queryByTestId("chat")).toBeNull();
  });

  it("wraps the children in the dark chat theme once connected", () => {
    chat.useCreateChatClient.mockReturnValue({ id: "client-1" });

    render(
      <ChatClientProvider user={{ id: "user-1" }}>
        <span>app</span>
      </ChatClientProvider>,
    );

    const provider = screen.getByTestId("chat");
    expect(provider).toHaveAttribute("data-client", "client-1");
    expect(provider).toHaveAttribute("data-theme", "str-chat__theme-dark");
    expect(provider).toContainElement(screen.getByText("app"));
  });
});
