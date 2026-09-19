import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import UpgradeNav from "./UpgradeNav";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(false),
  },
}));

const auth = vi.hoisted(() => ({
  keycloak: null as Awaited<ReturnType<typeof import("../../test/keycloak")["createKeycloakMock"]>> | null,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: auth.keycloak ?? createKeycloakMock(),
      initialized: true,
    }),
  };
});

const renderNav = () =>
  renderWithProviders(
    <Routes>
      <Route path="/upgrade" element={<UpgradeNav />} />
      <Route path="/" element={<div>home-page</div>} />
      <Route path="/profile" element={<div>profile-page</div>} />
    </Routes>,
    { route: "/upgrade" },
  );

describe("UpgradeNav", () => {
  beforeEach(async () => {
    const { createKeycloakMock } = await import("../../test/keycloak");
    auth.keycloak = createKeycloakMock({ name: "Demo User" });
  });

  it("shows the loading spinner while the profile request is pending", async () => {
    server.use(
      http.get("*/me", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ name: "Demo User", avatar: "https://img.test/avatar.jpg" });
      }),
    );

    renderNav();

    expect(screen.getByLabelText("three-dots-loading")).toBeInTheDocument();
    expect(await screen.findByText("Demo User")).toBeInTheDocument();
  });

  it("shows login and register actions when there is no profile", async () => {
    mockEndpoint("get", "*/me", null);
    renderNav();

    await userEvent.click(await screen.findByText("Đăng ký"));
    await userEvent.click(screen.getByText("Đăng nhập"));

    expect(auth.keycloak?.register).toHaveBeenCalledTimes(1);
    expect(auth.keycloak?.login).toHaveBeenCalledTimes(1);
  });

  it("renders the profile entry, navigates to the profile, and supports logout", async () => {
    mockEndpoint("get", "*/me", {
      name: "Demo User",
      avatar: "https://img.test/avatar.jpg",
    });
    renderNav();

    expect(await screen.findByText("Demo User")).toBeInTheDocument();
    expect(screen.getByTitle("Đăng xuất")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Demo User"));
    expect(await screen.findByText("profile-page")).toBeInTheDocument();

    renderNav();
    expect(await screen.findByText("Demo User")).toBeInTheDocument();

    await userEvent.click(screen.getByTitle("Đăng xuất"));
    expect(auth.keycloak?.logout).toHaveBeenCalledTimes(1);
  });

  it("navigates back to the home page", async () => {
    mockEndpoint("get", "*/me", {
      name: "Demo User",
      avatar: "https://img.test/avatar.jpg",
    });
    renderNav();

    await userEvent.click(await screen.findByText("Về trang chủ"));

    expect(await screen.findByText("home-page")).toBeInTheDocument();
  });
});
