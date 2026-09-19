import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import type { SideItem, SideItemClickHandler } from "../Sidebar/Sidebar";
import UseProfileSide from "./UseProfileSide";

const kc = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

const session = vi.hoisted(() => ({ roles: [] as string[] }));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  const keycloak = { ...createKeycloakMock(), ...kc };
  return { useKeycloak: () => ({ keycloak, initialized: true }) };
});

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => ({
      sub: "user-1",
      resource_access: { purepixel: { roles: session.roles } },
    }),
  },
}));

type StubProps = {
  sideItems: SideItem<string>[];
  activeItem?: unknown;
  handleClick: SideItemClickHandler<string>;
  userData?: { name?: string };
  handleLogin?: () => void;
  handleRegister?: () => void;
  handleLogout?: () => void;
};

vi.mock("./UserProfileSideBar", () => ({
  default: (props: StubProps) => (
    <div>
      <ul>
        {props.sideItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() =>
                props.handleClick(item.id, item.title, item.icon, item.quote)
              }
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
      <span data-testid="active">{String(props.activeItem)}</span>
      <span data-testid="name">{props.userData?.name ?? "no profile"}</span>
      <button onClick={props.handleLogin}>login</button>
      <button onClick={props.handleRegister}>register</button>
      <button onClick={props.handleLogout}>logout</button>
    </div>
  ),
}));

const PHOTOGRAPHER_ONLY = [
  "Cửa hàng của tôi",
  "Quản lý gói chụp",
  "Yêu cầu chụp của khách",
];

const respondWithProfile = () =>
  server.use(
    http.get("*/me", () => HttpResponse.json({ id: "user-1", name: "Minh" })),
  );

describe("UseProfileSide", () => {
  beforeEach(() => {
    session.roles = [];
    UseUserProfileStore.setState({ activeItem: "MyPhotos" });
    kc.login.mockClear();
    kc.register.mockClear();
    kc.logout.mockClear();
  });

  it("shows the customer menu and the loaded profile", async () => {
    respondWithProfile();
    renderWithProviders(<UseProfileSide />);

    expect(await screen.findByText("Minh")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Hồ sơ",
      "Ảnh của tôi",
      "Ảnh đã mua",
      "Ví",
      "Yêu cầu chụp của tôi",
    ]);
    expect(screen.getByTestId("active")).toHaveTextContent("MyPhotos");
  });

  it("adds the photographer tools for photographers", async () => {
    session.roles = ["photographer"];
    respondWithProfile();
    renderWithProviders(<UseProfileSide />);

    await screen.findByText("Minh");
    for (const title of PHOTOGRAPHER_ONLY) {
      expect(screen.getByRole("button", { name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });

  it("stores the selected item", async () => {
    respondWithProfile();
    renderWithProviders(<UseProfileSide />);

    await userEvent.click(screen.getByRole("button", { name: "Ví" }));

    expect(UseUserProfileStore.getState()).toMatchObject({
      activeItem: "transaction",
      activeTitle: "Ví",
      activeQuote: undefined,
    });
    await screen.findByText("Minh");
  });

  it("logs in, registers and logs out back to the public site", async () => {
    respondWithProfile();
    renderWithProviders(<UseProfileSide />);
    await screen.findByText("Minh");

    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await userEvent.click(screen.getByRole("button", { name: "register" }));
    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(kc.login).toHaveBeenCalledTimes(1);
    expect(kc.register).toHaveBeenCalledTimes(1);
    expect(kc.logout).toHaveBeenCalledWith({
      redirectUri: "https://purepixel.io.vn",
    });
  });

  it("keeps the menu when the profile cannot be loaded", async () => {
    server.use(http.get("*/me", () => new HttpResponse(null, { status: 500 })));
    const { queryClient } = renderWithProviders(<UseProfileSide />);

    await waitFor(() =>
      expect(queryClient.getQueryState(["me"])?.status).toBe("error"),
    );
    expect(screen.getByTestId("name")).toHaveTextContent("no profile");
    expect(screen.getByRole("button", { name: "Hồ sơ" })).toBeInTheDocument();
  });
});
