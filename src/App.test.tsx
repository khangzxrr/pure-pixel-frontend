import { render, screen } from "@testing-library/react";
import App from "./App";

const oneSignalInitMock = vi.hoisted(() => vi.fn());
const oneSignalLoginMock = vi.hoisted(() => vi.fn());

vi.mock("react-onesignal", () => ({
  default: {
    init: oneSignalInitMock,
    login: oneSignalLoginMock,
  },
}));

vi.mock("./services/Keycloak", () => ({
  default: {
    keycloakService: {},
    getUserId: () => "user-1",
    getToken: () => undefined,
    getTokenParsed: () => undefined,
    isLoggedIn: () => false,
    updateToken: vi.fn(),
    forceRefreshToken: vi.fn(),
    hasRole: () => false,
    getUserRoles: () => [],
  },
}));

let capturedKeycloakProps: {
  children?: React.ReactNode;
  onEvent?: (event: string, error?: unknown) => void;
} = {};

vi.mock("@react-keycloak/web", () => ({
  ReactKeycloakProvider: (props: {
    children: React.ReactNode;
    onEvent?: (event: string, error?: unknown) => void;
  }) => {
    capturedKeycloakProps = props;
    return <>{props.children}</>;
  },
}));

vi.mock("./routers/AppRouter", () => ({
  AppRouter: {},
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    RouterProvider: () => <div>mocked router content</div>,
  };
});

vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null,
}));

vi.mock("./components/ChatComponent/ChatProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chat-provider">{children}</div>
  ),
}));

vi.mock("./components/ComThanksModal/ComThanksModal", () => ({
  default: () => <div>thanks modal</div>,
}));

describe("App", () => {
  beforeEach(() => {
    oneSignalInitMock.mockReset();
    oneSignalLoginMock.mockReset();
    capturedKeycloakProps = {};
  });

  it("renders the router, chat provider and thanks modal", () => {
    render(<App />);

    expect(screen.getByText("mocked router content")).toBeInTheDocument();
    expect(screen.getByTestId("chat-provider")).toBeInTheDocument();
    expect(screen.getByText("thanks modal")).toBeInTheDocument();
  });

  it("does not initialize OneSignal when running on localhost", () => {
    render(<App />);
    expect(oneSignalInitMock).not.toHaveBeenCalled();
  });

  it("does not log in to OneSignal on auth success while on localhost", async () => {
    render(<App />);

    await capturedKeycloakProps.onEvent?.("onAuthSuccess");

    expect(oneSignalLoginMock).not.toHaveBeenCalled();
  });

  it("ignores non auth-success keycloak events", async () => {
    render(<App />);

    await capturedKeycloakProps.onEvent?.("onAuthRefreshError");

    expect(oneSignalLoginMock).not.toHaveBeenCalled();
    expect(oneSignalInitMock).not.toHaveBeenCalled();
  });
});
