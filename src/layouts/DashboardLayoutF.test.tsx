import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/render";
import UseNotificationStore from "../states/UseNotificationStore";
import UseSidebarStore from "../states/UseSidebarStore";
import DashboardLayoutF from "./DashboardLayoutF";

vi.mock("../components/ServerSide/ServerSide", () => ({
  default: () => <div data-testid="server-side">server side</div>,
}));

vi.mock("../components/ComNotificate/NotificationModal", () => ({
  default: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <button onClick={onClose} type="button">
      notification {isOpen ? "open" : "closed"}
    </button>
  ),
}));

const renderLayout = () =>
  renderWithProviders(
    <Routes>
      <Route element={<DashboardLayoutF />}>
        <Route index element={<div>dashboard outlet</div>} />
      </Route>
    </Routes>,
    { route: "/" },
  );

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

afterEach(() => {
  UseSidebarStore.setState({ isSidebarOpen: false, activeLink: null });
  UseNotificationStore.setState({ isNotificationOpen: false });
  vi.restoreAllMocks();
});

describe("DashboardLayoutF", () => {
  it("renders the outlet, server sidebar and notification modal", async () => {
    setWindowWidth(500);
    UseSidebarStore.setState({ isSidebarOpen: true });
    UseNotificationStore.setState({ isNotificationOpen: true });

    renderLayout();

    expect(screen.getByText("dashboard outlet")).toBeInTheDocument();
    expect(screen.getByTestId("server-side").parentElement).toHaveClass("flex");
    expect(screen.getByRole("button", { name: "notification open" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "notification open" }));
    expect(UseNotificationStore.getState().isNotificationOpen).toBe(false);
  });

  it("closes the sidebar on large screens and cleans up the resize listener", () => {
    setWindowWidth(1400);
    UseSidebarStore.setState({ isSidebarOpen: true });
    const removeListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderLayout();

    expect(UseSidebarStore.getState().isSidebarOpen).toBe(false);

    unmount();

    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
