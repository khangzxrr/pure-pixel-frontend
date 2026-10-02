import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import type { ChatMessage } from "../../apis/ChatApi";
import ChatProvider, { useChatMessages } from "./ChatProvider";

const auth = vi.hoisted(() => ({ initialized: true, authenticated: true, token: "tok-1" }));

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    initialized: auth.initialized,
    keycloak: {
      authenticated: auth.authenticated,
      token: auth.authenticated ? auth.token : undefined,
      tokenParsed: auth.authenticated ? { sub: "me" } : undefined,
    },
  }),
}));

vi.mock("../../pages/LoadingPage", () => ({ default: () => <div>loading page</div> }));

type Handler = (...args: unknown[]) => void;
const socketMock = vi.hoisted(() => {
  const handlers: Record<string, Handler[]> = {};
  const socket = {
    auth: {} as Record<string, unknown>,
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
  const reset = () => {
    Object.keys(handlers).forEach((key) => delete handlers[key]);
    socket.auth = {};
  };
  return { socket, fire, reset, io: vi.fn(() => socket) };
});

vi.mock("socket.io-client", () => ({ io: socketMock.io, default: socketMock.io }));

const message = (id: string): ChatMessage => ({
  id,
  conversationId: "c1",
  senderId: "bob",
  content: `text ${id}`,
  createdAt: "2026-09-05T00:00:00.000Z",
});

function Listener() {
  const [received, setReceived] = useState<string[]>([]);
  useChatMessages((m) => setReceived((prev) => [...prev, m.content]));
  return <div>received: {received.join(",")}</div>;
}

describe("ChatProvider", () => {
  beforeEach(() => {
    auth.initialized = true;
    auth.authenticated = true;
    socketMock.reset();
    socketMock.io.mockClear();
    socketMock.socket.emit.mockClear();
    socketMock.socket.disconnect.mockClear();
  });

  it("shows the loading page until keycloak is ready", () => {
    auth.initialized = false;
    render(<ChatProvider>app</ChatProvider>);
    expect(screen.getByText("loading page")).toBeInTheDocument();
    expect(screen.queryByText("app")).not.toBeInTheDocument();
  });

  it("renders children without a socket when signed out", () => {
    auth.authenticated = false;
    render(
      <ChatProvider>
        <Listener />
      </ChatProvider>,
    );
    expect(screen.getByText("received:")).toBeInTheDocument();
    expect(socketMock.io).not.toHaveBeenCalled();
  });

  it("connects to the chat namespace with the bearer token and joins the chat room", () => {
    render(<ChatProvider>app</ChatProvider>);

    expect(screen.getByText("app")).toBeInTheDocument();
    expect(socketMock.io).toHaveBeenCalledTimes(1);
    const [url, options] = socketMock.io.mock.calls[0] as unknown as [
      string,
      { transports: string[]; auth: { token: string } },
    ];
    expect(url).toMatch(/\/chat$/);
    expect(options.transports).toEqual(["websocket"]);
    expect(options.auth.token).toBe("bearer tok-1");

    act(() => socketMock.fire("connect"));
    expect(socketMock.socket.emit).toHaveBeenCalledWith("join-chat");
  });

  it("delivers pushed messages to subscribers until they unmount", () => {
    const { rerender } = render(
      <ChatProvider>
        <Listener />
      </ChatProvider>,
    );

    act(() => socketMock.fire("chat-message", message("a")));
    act(() => socketMock.fire("chat-message", message("b")));
    expect(screen.getByText("received: text a,text b")).toBeInTheDocument();

    rerender(<ChatProvider>none</ChatProvider>);
    expect(() => act(() => socketMock.fire("chat-message", message("c")))).not.toThrow();
  });

  it("disconnects the socket on unmount", () => {
    const { unmount } = render(<ChatProvider>app</ChatProvider>);
    unmount();
    expect(socketMock.socket.disconnect).toHaveBeenCalled();
  });

  it("does nothing when used outside a provider", () => {
    render(<Listener />);
    expect(screen.getByText("received:")).toBeInTheDocument();
  });
});
