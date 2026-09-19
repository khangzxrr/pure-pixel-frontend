import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEndpoint } from "../../test/mockEndpoint";
import { renderWithProviders } from "../../test/render";
import PolicyPage from "./PolicyPage";

const navigateMock = vi.hoisted(() => vi.fn());
const keycloakMock = vi.hoisted(() => ({
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({ keycloak: keycloakMock, initialized: true }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("PolicyPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    keycloakMock.logout.mockReset();
    keycloakMock.login.mockReset();
    keycloakMock.register.mockReset();
  });

  it("shows sign in and register actions for a signed out visitor", async () => {
    mockEndpoint("get", "*/me", () => new Response(null, { status: 401 }));

    renderWithProviders(<PolicyPage />);

    expect(await screen.findByText("Đăng nhập")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Đăng nhập"));
    expect(keycloakMock.login).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByText("Đăng ký"));
    expect(keycloakMock.register).toHaveBeenCalledTimes(1);
  });

  it("shows the signed in user and lets them navigate home, to their profile, or log out", async () => {
    mockEndpoint("get", "*/me", { name: "Khang", avatar: "/avatar.jpg" });

    renderWithProviders(<PolicyPage />);

    expect(await screen.findByText("Khang")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Về trang chủ"));
    expect(navigateMock).toHaveBeenCalledWith("/");

    await userEvent.click(screen.getByText("Khang"));
    expect(navigateMock).toHaveBeenCalledWith("/profile");

    await userEvent.click(screen.getByTitle("Đăng xuất"));
    expect(keycloakMock.logout).toHaveBeenCalledTimes(1);
  });

  it("renders the policy content", async () => {
    mockEndpoint("get", "*/me", () => new Response(null, { status: 401 }));

    renderWithProviders(<PolicyPage />);

    expect(await screen.findByText("ĐIỀU KHOẢN SỬ DỤNG")).toBeInTheDocument();
  });
});
