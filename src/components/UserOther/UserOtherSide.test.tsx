import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UserOtherSide from "./UserOtherSide";

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

vi.mock("./UserOtherSidebar", () => ({
  default: ({
    sideItems,
    activeItem,
    handleClick,
    userData,
    handleLogin,
    handleRegister,
    handleLogout,
  }: {
    sideItems: Array<{ id: string; title: string; link: string; icon?: React.ReactNode }>;
    activeItem: string | null;
    handleClick: (
      id: string,
      title: string,
      icon: React.ReactNode,
      quote: string | undefined,
    ) => void;
    userData?: { name?: string };
    handleLogin: () => void;
    handleRegister: () => void;
    handleLogout: () => void;
  }) => (
    <div>
      <div>viewer {userData?.name}</div>
      <div>active item {activeItem ?? "none"}</div>
      {sideItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id, item.title, item.icon, undefined)}
        >
          {item.title}::{item.link}
        </button>
      ))}
      <button onClick={handleLogin}>login action</button>
      <button onClick={handleRegister}>register action</button>
      <button onClick={handleLogout}>logout action</button>
    </div>
  ),
}));

const initialUserOtherState = UseUserOtherStore.getState();

describe("UserOtherSide", () => {
  beforeEach(() => {
    keycloakState.mock = freshKeycloakMock();
    UseUserOtherStore.setState(initialUserOtherState, true);
  });

  afterEach(() => {
    UseUserOtherStore.setState(initialUserOtherState, true);
  });

  it("initializes the profile tab from the route and lets visitors switch sections", async () => {
    renderWithProviders(<UserOtherSide />, {
      route: "/user/u77/photos",
      path: "/user/:userId/photos",
    });

    expect(await screen.findByText("viewer Viewer")).toBeInTheDocument();
    expect(UseUserOtherStore.getState()).toMatchObject({
      userOtherId: "u77",
      activeItem: "UO2",
      activeTitle: "Hồ sơ",
    });
    expect(screen.getByText("active item UO2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hồ sơ::\/user\/u77\/photos/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Các gói dịch vụ::\/user\/u77\/packages/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Các ảnh đang bán::\/user\/u77\/selling/ }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Các gói dịch vụ::\/user\/u77\/packages/ }),
    );

    expect(UseUserOtherStore.getState()).toMatchObject({
      activeItem: "UO3",
      activeTitle: "Các gói dịch vụ",
    });
  });

  it("uses the stored user id when no route param exists and forwards auth actions", async () => {
    UseUserOtherStore.setState({ userOtherId: "seeded-user" });

    renderWithProviders(<UserOtherSide />);

    expect(
      screen.getByRole("button", { name: /Hồ sơ::\/user\/seeded-user\/photos/ }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "login action" }));
    await userEvent.click(screen.getByRole("button", { name: "register action" }));
    await userEvent.click(screen.getByRole("button", { name: "logout action" }));

    expect(keycloakState.mock.login).toHaveBeenCalledTimes(1);
    expect(keycloakState.mock.register).toHaveBeenCalledTimes(1);
    expect(keycloakState.mock.logout).toHaveBeenCalledWith({
      redirectUri: "https://purepixel.io.vn",
    });
  });
});
