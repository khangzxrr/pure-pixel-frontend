import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UseInspirationStore from "../../states/UseInspirationStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import Explore from "./Explore";

const navigate = vi.hoisted(() => vi.fn());

const kc = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

type TokenParsed = {
  sub: string;
  resource_access: { purepixel: { roles: string[] } };
};

const session = vi.hoisted(() => ({
  token: undefined as TokenParsed | undefined,
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  const keycloak = { ...createKeycloakMock(), ...kc };
  return { useKeycloak: () => ({ keycloak, initialized: true }) };
});

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => session.token,
  },
}));

type NavStubProps = { activeTitle?: ReactNode; toggleSidebar?: () => void };

// vi.mock factories are hoisted, so the shared stub has to be hoisted too
const navStub = vi.hoisted(() => (name: string) => ({
  default: ({ activeTitle, toggleSidebar }: NavStubProps) =>
    `${name}: ${String(activeTitle)}${toggleSidebar ? ` | ${name} can toggle` : ""}`,
}));

vi.mock("../Inspiration/InspirationSide/InspirationSideComp", () => ({
  default: () => <div>inspiration side</div>,
}));
vi.mock("../Inspiration/InspirationNav/InspirationNav", () =>
  navStub("inspiration nav"),
);
vi.mock("../Photographer/PhotographerList/PhotographerNav", () =>
  navStub("photographer nav"),
);
vi.mock("../SellingPhoto/SellingPhotoNav", () => navStub("selling nav"));
vi.mock("../ComCamera/CameraNav", () => navStub("camera nav"));
vi.mock("../Booking/PhotoshootPackageNav", () => navStub("package nav"));

const signIn = (roles: string[]) => {
  session.token = { sub: "user-1", resource_access: { purepixel: { roles } } };
};

const respondWithProfile = () =>
  server.use(
    http.get("*/me", () =>
      HttpResponse.json({ id: "user-1", name: "Minh", avatar: "minh.png" }),
    ),
  );

const setWidth = (width: number) => {
  window.innerWidth = width;
};

describe("Explore", () => {
  beforeEach(() => {
    setWidth(800);
    session.token = undefined;
    navigate.mockClear();
    kc.login.mockClear();
    kc.register.mockClear();
    kc.logout.mockClear();
    UseSidebarStore.setState({ isSidebarOpen: false });
    UseInspirationStore.setState({
      activeItem: null,
      activeTitle: "Cảm hứng",
      activeIcon: null,
    });
  });

  afterAll(() => {
    setWidth(1024);
  });

  describe("account area", () => {
    it("offers sign up and sign in to visitors", async () => {
      server.use(http.get("*/me", () => new HttpResponse(null, { status: 401 })));
      const { queryClient } = renderWithProviders(<Explore />);

      await waitFor(() =>
        expect(queryClient.getQueryState(["me"])?.status).toBe("error"),
      );
      await userEvent.click(screen.getByRole("button", { name: "Đăng ký" }));
      await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

      expect(kc.register).toHaveBeenCalledTimes(1);
      expect(kc.login).toHaveBeenCalledTimes(1);
      expect(screen.getByText("inspiration side")).toBeInTheDocument();
    });

    it("hides sign up when Keycloak registration is off", async () => {
      server.use(http.get("*/me", () => new HttpResponse(null, { status: 401 })));
      const { queryClient } = renderWithProviders(<Explore />, {
        featureFlags: { registration: false },
      });

      await waitFor(() =>
        expect(queryClient.getQueryState(["me"])?.status).toBe("error"),
      );
      expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Đăng ký" })).not.toBeInTheDocument();
    });

    it("shows a skeleton while a signed-in profile loads", async () => {
      signIn([]);
      server.use(
        http.get("*/me", async () => {
          await delay("infinite");
          return HttpResponse.json({});
        }),
      );
      const { container } = renderWithProviders(<Explore />);

      expect(container.querySelector(".custom-skeleton-button")).not.toBeNull();
      expect(screen.queryByRole("button", { name: "Đăng nhập" })).toBeNull();
    });

    it("shows the signed-in user and opens the profile", async () => {
      signIn([]);
      respondWithProfile();
      const { container } = renderWithProviders(<Explore />);

      expect(await screen.findByText("Minh")).toBeInTheDocument();
      expect(screen.getByAltText("avatar")).toHaveAttribute("src", "minh.png");
      expect(container.querySelector(".bg-yellow-500")).toBeNull();

      await userEvent.click(screen.getByText("Minh"));
      expect(navigate).toHaveBeenCalledWith("/profile");

      await userEvent.click(screen.getByTitle("Đăng xuất"));
      expect(kc.logout).toHaveBeenCalledTimes(1);
    });

    it("marks photographers with a camera badge", async () => {
      signIn(["photographer"]);
      respondWithProfile();
      const { container } = renderWithProviders(<Explore />);

      await screen.findByText("Minh");
      await waitFor(() =>
        expect(container.querySelector(".bg-yellow-500")).not.toBeNull(),
      );
    });

    it("treats a token without roles as a customer", async () => {
      session.token = { sub: "user-1" } as TokenParsed;
      respondWithProfile();
      const { container } = renderWithProviders(<Explore />);

      await screen.findByText("Minh");
      expect(container.querySelector(".bg-yellow-500")).toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it.each(["purepixel-admin", "manager"])(
    "sends %s users to the admin area",
    async (role) => {
      signIn([role]);
      respondWithProfile();
      renderWithProviders(<Explore />);

      expect(navigate).toHaveBeenCalledWith("/admin");
      await screen.findByText("Minh");
    },
  );

  it.each([
    [1, "inspiration nav", true],
    [4, "photographer nav", true],
    [6, "selling nav", false],
    [5, "camera nav", true],
    [8, "package nav", true],
  ])("shows the nav for active item %s", async (activeItem, nav, canToggle) => {
    // the explore menu uses numeric ids
    UseInspirationStore.setState({
      activeItem: activeItem as unknown as string,
    });
    respondWithProfile();
    renderWithProviders(<Explore />);

    const navText = screen.getByText(new RegExp(`^${nav}: Cảm hứng`)).textContent;
    // the selling nav is the only one rendered without the sidebar toggle
    expect(navText?.includes("can toggle")).toBe(canToggle);
    await screen.findByText("Minh");
  });

  it("shows the blog nav for active item 9", async () => {
    UseInspirationStore.setState({
      activeItem: 9 as unknown as string,
      activeTitle: "Blog",
    });
    respondWithProfile();
    renderWithProviders(<Explore />);

    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.queryByText(/nav:/)).toBeNull();
    await screen.findByText("Minh");
  });

  describe("sidebar", () => {
    it("opens from the menu icon and closes from the overlay on small screens", async () => {
      respondWithProfile();
      const { container } = renderWithProviders(<Explore />);
      const panel = container.querySelector(".bg-\\[\\#2f3136\\]");
      expect(panel).toHaveClass("-translate-x-full");

      await userEvent.click(container.querySelector("svg.lg\\:hidden") as Element);

      expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);
      expect(panel).toHaveClass("translate-x-0");
      const overlay = container.querySelector(".bg-black.bg-opacity-50");
      expect(overlay).not.toBeNull();

      await userEvent.click(overlay as Element);

      expect(UseSidebarStore.getState().isSidebarOpen).toBe(false);
      expect(container.querySelector(".bg-black.bg-opacity-50")).toBeNull();
      await screen.findByText("Minh");
    });

    it("toggles the sidebar whenever the window is large", async () => {
      setWidth(1280);
      respondWithProfile();
      const { container } = renderWithProviders(<Explore />);
      const panel = container.querySelector(".bg-\\[\\#2f3136\\]");

      expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);
      expect(panel).toHaveClass("translate-x-0");

      setWidth(800);
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
      expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);

      setWidth(1280);
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
      expect(UseSidebarStore.getState().isSidebarOpen).toBe(false);
      expect(panel).toHaveClass("translate-x-0");
      await screen.findByText("Minh");
    });
  });

  it("offers a back-to-top button after scrolling down", async () => {
    respondWithProfile();
    const { container } = renderWithProviders(<Explore />);
    const main = container.querySelector("#inspiration") as HTMLElement;
    const scrollTo = vi.fn();
    main.scrollTo = scrollTo;

    Object.defineProperty(main, "scrollTop", { value: 400, configurable: true });
    fireEvent.scroll(main);

    const backToTop = container.querySelector("button.fixed");
    expect(backToTop).not.toBeNull();
    await userEvent.click(backToTop as Element);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    Object.defineProperty(main, "scrollTop", { value: 100, configurable: true });
    fireEvent.scroll(main);
    expect(container.querySelector("button.fixed")).toBeNull();
    await screen.findByText("Minh");
  });
});
