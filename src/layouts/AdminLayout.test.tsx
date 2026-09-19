import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";

type AdminLayoutModuleOptions = {
  roles?: string[];
  profile?: { avatar?: string; name?: string };
  pendingProfile?: boolean;
};
const getMyProfileMock = vi.hoisted(() => vi.fn());

const scrollToMock = vi.fn();
Object.defineProperty(window, "scrollTo", {
  value: scrollToMock,
  writable: true,
});

const loadAdminLayout = async ({
  roles = [],
  profile = { avatar: "/avatar.png", name: "Admin User" },
  pendingProfile = false,
}: AdminLayoutModuleOptions = {}) => {
  vi.resetModules();
  const logout = vi.fn();
  getMyProfileMock.mockReset();
  if (pendingProfile) {
    getMyProfileMock.mockReturnValue(new Promise(() => {}));
  } else {
    getMyProfileMock.mockResolvedValue(profile);
  }

  vi.doMock("@react-keycloak/web", async () => {
    const { createKeycloakMock } = await import("../test/keycloak");
    return {
      useKeycloak: () => ({
        keycloak: {
          ...createKeycloakMock({ roles }),
          logout,
        },
        initialized: true,
      }),
    };
  });

  vi.doMock("../services/Keycloak", () => ({
    default: {
      getTokenParsed: () => ({
        resource_access: { purepixel: { roles } },
      }),
    },
  }));
  vi.doMock("../apis/UserProfile", () => ({
    default: {
      getMyProfile: (...args: unknown[]) => getMyProfileMock(...args),
    },
  }));

  const { default: AdminLayout } = await import("./AdminLayout");
  return { AdminLayout, logout };
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminLayout", () => {
  it("shows a loading state while the profile is being fetched", async () => {
    const { AdminLayout } = await loadAdminLayout({ pendingProfile: true });

    renderWithProviders(
      <AdminLayout>
        <div>admin child</div>
      </AdminLayout>,
      { route: "/admin/upgrade" },
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("admin child")).toBeNull();
  });

  it("renders the admin navigation, profile menu and mobile sidebar", async () => {
    const { AdminLayout, logout } = await loadAdminLayout();

    renderWithProviders(
      <AdminLayout>
        <div>admin child</div>
      </AdminLayout>,
      { route: "/admin/Dashboard" },
    );
    expect(await screen.findByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin child")).toBeInTheDocument();
    expect(screen.getByText("admin child")).toBeInTheDocument();
    expect(getMyProfileMock).toHaveBeenCalledTimes(1);
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);

    const dashboardLinks = screen
      .getAllByText("Thống kê")
      .map((element) => element.closest("a"))
      .filter((element): element is HTMLAnchorElement => !!element);

    expect(dashboardLinks[0]).toHaveAttribute("href", "/admin/Dashboard");
    expect(
      dashboardLinks.some((link) => link.className.includes("bg-gray-50")),
    ).toBe(true);

    await userEvent.click(
      screen.getByRole("button", { name: "Open sidebar" }),
    );
    expect(
      screen.getByRole("button", { name: "Close sidebar" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Close sidebar" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Close sidebar" }),
      ).toBeNull(),
    );

    await userEvent.click(screen.getByRole("button", { name: "Open user menu" }));
    const logoutButtons = await screen.findAllByText("Đăng xuất");
    await userEvent.click(logoutButtons[0]);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("renders the transaction and withdrawal-processing links as active on their routes", async () => {
    const { AdminLayout } = await loadAdminLayout();

    renderWithProviders(
      <AdminLayout>
        <div>admin child</div>
      </AdminLayout>,
      { route: "/admin/transaction" },
    );
    await screen.findByText("Admin User");

    const transactionLinks = screen
      .getAllByText("Giao dịch")
      .map((element) => element.closest("a"))
      .filter((element): element is HTMLAnchorElement => !!element);
    expect(transactionLinks.length).toBeGreaterThan(0);
    expect(transactionLinks[0]).toHaveAttribute("href", "/admin/transaction");
    expect(
      transactionLinks.some((link) => link.className.includes("bg-gray-50")),
    ).toBe(true);

    const withdrawalLinks = screen
      .getAllByText("Xử lý rút tiền")
      .map((element) => element.closest("a"))
      .filter((element): element is HTMLAnchorElement => !!element);
    expect(withdrawalLinks.length).toBeGreaterThan(0);
    expect(withdrawalLinks[0]).toHaveAttribute(
      "href",
      "/admin/withdrawal-processing",
    );
  });

  it("hides the dashboard entry for manager accounts", async () => {
    const { AdminLayout } = await loadAdminLayout({
      roles: ["manager"],
      profile: { avatar: "/manager.png", name: "Manager User" },
    });

    renderWithProviders(
      <AdminLayout>
        <div>manager child</div>
      </AdminLayout>,
      { route: "/admin/upgrade" },
    );

    expect(await screen.findByText("Manager User")).toBeInTheDocument();
    expect(screen.queryByText("Thống kê")).toBeNull();

    const upgradeLinks = screen
      .getAllByText("Gói nâng cấp")
      .map((element) => element.closest("a"))
      .filter((element): element is HTMLAnchorElement => !!element);

    expect(upgradeLinks[0]).toHaveAttribute("href", "/admin/upgrade");
  });
});
