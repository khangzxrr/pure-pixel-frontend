import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/render";
import UseCameraStore from "../states/UseCameraStore";
import SidebarLayout from "./SidebarLayout";

const getApplicationProfileMock = vi.fn();

vi.mock("../services/Keycloak", () => ({
  default: {
    getTokenParsed: () => undefined,
  },
}));

vi.mock("../apis/UserApi", () => ({
  default: {
    getApplicationProfile: (...args: unknown[]) => getApplicationProfileMock(...args),
  },
}));

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

const renderSidebarLayout = ({
  route = "/",
  parentPath = "/",
  props = {},
  featureFlags,
}: {
  route?: string;
  parentPath?: string;
  props?: Partial<React.ComponentProps<typeof SidebarLayout>>;
  featureFlags?: { registration?: boolean };
} = {}) => {
  const defaultProps: React.ComponentProps<typeof SidebarLayout> = {
    isSidebarOpen: false,
    toggleSidebar: vi.fn(),
    userData: {
      resource_access: { purepixel: { roles: ["photographer"] } },
    },
    activeIcon: <span>camera icon</span>,
    activeTitle: "Camera title",
    sidebarContent: <div>sidebar content</div>,
    onLogout: vi.fn(),
    onLogin: vi.fn(),
    onRegister: vi.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };
  const result = renderWithProviders(
    <Routes>
      <Route path={parentPath} element={<SidebarLayout {...mergedProps} />}>
        <Route index element={<div>sidebar outlet</div>} />
      </Route>
      <Route path="/profile/userprofile" element={<div>profile page</div>} />
    </Routes>,
    { route, featureFlags },
  );

  return { ...result, props: mergedProps };
};

beforeEach(() => {
  getApplicationProfileMock.mockReset();
  getApplicationProfileMock.mockResolvedValue({
    avatar: "/avatar.png",
    name: "Camera User",
  });
  UseCameraStore.setState({
    brandCamera: "Canon",
    nameCamera: "R5",
    isSidebarOpen: false,
    activeItem: null,
    activeIcon: null,
    activeTitle: null,
    hoveredItem: null,
    nameBrandCamera: "",
    listTopBrandCamera: [],
    listTopCameraByBrand: [],
    idCamera: null,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SidebarLayout", () => {
  it("renders the signed-in profile section, clears camera filters and navigates to the profile page", async () => {
    const { props } = renderSidebarLayout({
      route: "/camera/all",
      parentPath: "/camera/all",
    });

    expect(await screen.findByText("Camera User")).toBeInTheDocument();
    expect(screen.getByText("sidebar content")).toBeInTheDocument();
    expect(screen.getByText("sidebar outlet")).toBeInTheDocument();
    expect(UseCameraStore.getState().brandCamera).toBe("");
    expect(UseCameraStore.getState().nameCamera).toBe("");

    await userEvent.click(screen.getByTitle("Đăng xuất"));
    expect(props.onLogout).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByText("Camera User"));
    expect(await screen.findByText("profile page")).toBeInTheDocument();
  });

  it("renders guest actions and closes the overlays when the sidebar is open", async () => {
    const toggleSidebar = vi.fn();
    const onLogin = vi.fn();
    const onRegister = vi.fn();
    const { container } = renderSidebarLayout({
      props: {
        isSidebarOpen: true,
        toggleSidebar,
        userData: undefined,
        onLogin,
        onRegister,
      },
    });

    await userEvent.click(screen.getByRole("button", { name: "Đăng ký" }));
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledTimes(1);

    const overlays = container.querySelectorAll("div.bg-black.bg-opacity-50");
    expect(overlays.length).toBeGreaterThan(0);
    fireEvent.click(overlays[0]);
    expect(toggleSidebar).toHaveBeenCalled();
  });

  it("shows the scroll-to-top button after scrolling and expands the sidebar on resize", async () => {
    setWindowWidth(500);
    const toggleSidebar = vi.fn();
    const { container, unmount } = renderSidebarLayout({
      props: { toggleSidebar, userData: undefined },
    });

    const main = document.getElementById("main") as HTMLDivElement;
    main.scrollTo = vi.fn();
    Object.defineProperty(main, "scrollTop", {
      writable: true,
      configurable: true,
      value: 400,
    });

    fireEvent.scroll(main);

    const scrollButton = container.querySelector("button.fixed") as HTMLButtonElement;
    expect(scrollButton).toBeInTheDocument();
    await userEvent.click(scrollButton);
    expect(main.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    setWindowWidth(1300);
    fireEvent(window, new Event("resize"));
    await waitFor(() => expect(toggleSidebar).toHaveBeenCalledWith(true));

    unmount();
  });

  it("hides the register button when Keycloak registration is off", () => {
    renderSidebarLayout({
      props: { isSidebarOpen: true, userData: undefined },
      featureFlags: { registration: false },
    });

    expect(screen.queryByRole("button", { name: "Đăng ký" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument();
  });
});
