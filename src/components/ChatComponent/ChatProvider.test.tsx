import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ChatProvider from "./ChatProvider";

const auth = vi.hoisted(() => ({
  initialized: true,
  authenticated: true,
  withoutSubject: false,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => {
      const keycloak = createKeycloakMock({
        authenticated: auth.authenticated,
        sub: "user-1",
        name: "Minh",
      });
      return {
        keycloak: auth.withoutSubject
          ? { ...keycloak, tokenParsed: { name: "Minh" } }
          : keycloak,
        initialized: auth.initialized,
      };
    },
  };
});

vi.mock("./ChatClientProvider", () => ({
  default: ({
    user,
    children,
  }: {
    user: { id: string; name?: string };
    children?: ReactNode;
  }) => (
    <div data-testid="chat-client" data-user={JSON.stringify(user)}>
      {children}
    </div>
  ),
}));

vi.mock("../../pages/LoadingPage", () => ({
  default: () => <div>loading page</div>,
}));

describe("ChatProvider", () => {
  afterEach(() => {
    auth.initialized = true;
    auth.authenticated = true;
    auth.withoutSubject = false;
  });

  it("shows the loading page until Keycloak is initialized", () => {
    auth.initialized = false;
    render(
      <ChatProvider>
        <span>app</span>
      </ChatProvider>,
    );

    expect(screen.getByText("loading page")).toBeInTheDocument();
    expect(screen.queryByText("app")).toBeNull();
  });

  it("connects signed-in users to chat", () => {
    render(
      <ChatProvider>
        <span>app</span>
      </ChatProvider>,
    );

    const provider = screen.getByTestId("chat-client");
    expect(JSON.parse(provider.dataset.user ?? "")).toEqual({
      id: "user-1",
      name: "Minh",
    });
    expect(provider).toContainElement(screen.getByText("app"));
  });

  it("renders the app without chat when signed out", () => {
    auth.authenticated = false;
    render(
      <ChatProvider>
        <span>app</span>
      </ChatProvider>,
    );

    expect(screen.getByText("app")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-client")).toBeNull();
  });

  it("renders the app without chat when the token has no subject", () => {
    auth.withoutSubject = true;
    render(
      <ChatProvider>
        <span>app</span>
      </ChatProvider>,
    );

    expect(screen.getByText("app")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-client")).toBeNull();
  });
});
