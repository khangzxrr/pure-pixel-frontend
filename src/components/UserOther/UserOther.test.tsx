import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseSidebarStore from "../../states/UseSidebarStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UserOther from "./UserOther";

const freshKeycloakMock = () => ({
  authenticated: true,
  token: "test-token",
  tokenParsed: {
    sub: "viewer-1",
    name: "Viewer",
    preferred_username: "Viewer",
    resource_access: { purepixel: { roles: ["viewer"] } },
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateToken: vi.fn().mockResolvedValue(true),
  hasResourceRole: vi.fn((role: string) => role === "viewer"),
});

const keycloakState = vi.hoisted(() => ({
  mock: {
    authenticated: true,
    token: "test-token",
    tokenParsed: {
      sub: "viewer-1",
      name: "Viewer",
      preferred_username: "Viewer",
      resource_access: { purepixel: { roles: ["viewer"] } },
    },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateToken: vi.fn().mockResolvedValue(true),
    hasResourceRole: vi.fn((role: string) => role === "viewer"),
  },
}));

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({ keycloak: keycloakState.mock, initialized: true }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => ({ sub: "viewer-1", name: "Viewer" }),
  },
}));

vi.mock("../../layouts/SidebarLayout", () => ({
  default: ({
    isSidebarOpen,
    toggleSidebar,
    userData,
    activeIcon,
    activeTitle,
    activeQuote,
    sidebarContent,
    onLogin,
    onRegister,
    onLogout,
  }: {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    userData?: { name?: string };
    activeIcon: React.ReactNode;
    activeTitle?: string | null;
    activeQuote?: React.ReactNode;
    sidebarContent: React.ReactNode;
    onLogin: () => void;
    onRegister: () => void;
    onLogout: () => void;
  }) => (
    <div>
      <div>sidebar open {String(isSidebarOpen)}</div>
      <div>user {userData?.name}</div>
      <div>title {activeTitle}</div>
      <div>{activeIcon}</div>
      <div>quote {String(activeQuote)}</div>
      <button onClick={toggleSidebar}>toggle sidebar</button>
      <button onClick={onLogin}>login from layout</button>
      <button onClick={onRegister}>register from layout</button>
      <button onClick={onLogout}>logout from layout</button>
      {sidebarContent}
    </div>
  ),
}));

vi.mock("./UserOtherSide", () => ({
  default: () => <div>user other side content</div>,
}));

const initialSidebarState = UseSidebarStore.getState();
const initialUserOtherState = UseUserOtherStore.getState();

describe("UserOther", () => {
  beforeEach(() => {
    keycloakState.mock = freshKeycloakMock();
    UseSidebarStore.setState(initialSidebarState, true);
    UseUserOtherStore.setState(initialUserOtherState, true);
  });

  afterEach(() => {
    UseSidebarStore.setState(initialSidebarState, true);
    UseUserOtherStore.setState(initialUserOtherState, true);
  });

  it("passes the active profile state into the layout and forwards sidebar/auth actions", async () => {
    UseSidebarStore.setState({ isSidebarOpen: false });
    UseUserOtherStore.setState({
      activeTitle: "Các gói dịch vụ",
      activeIcon: <span>camera icon</span>,
      activeQuote: "custom quote",
    });

    renderWithProviders(<UserOther />, {
      route: "/user/u1",
      path: "/user/:userId",
    });

    expect(screen.getByText("sidebar open false")).toBeInTheDocument();
    expect(screen.getByText("user Viewer")).toBeInTheDocument();
    expect(screen.getByText("title Các gói dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("camera icon")).toBeInTheDocument();
    expect(screen.getByText("quote custom quote")).toBeInTheDocument();
    expect(screen.getByText("user other side content")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "toggle sidebar" }));
    expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "login from layout" }));
    await userEvent.click(screen.getByRole("button", { name: "register from layout" }));
    await userEvent.click(screen.getByRole("button", { name: "logout from layout" }));

    expect(keycloakState.mock.login).toHaveBeenCalledTimes(1);
    expect(keycloakState.mock.register).toHaveBeenCalledTimes(1);
    expect(keycloakState.mock.logout).toHaveBeenCalledTimes(1);
  });
});
