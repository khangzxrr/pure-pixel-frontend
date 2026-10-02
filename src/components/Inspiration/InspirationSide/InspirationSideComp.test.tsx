import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/render";
import UseSidebarStore from "../../../states/UseSidebarStore";
import UseInspirationStore from "../../../states/UseInspirationStore";
import InspirationSideComp from "./InspirationSideComp";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("../../Explore/PhotoTagsTrend", () => ({
  default: () => <div>tags trend</div>,
}));

vi.mock("../InspirationPhoto/InsPhotoFilter", () => ({
  default: () => <div>photo filter</div>,
}));

describe("InspirationSideComp", () => {
  beforeEach(() => {
    UseSidebarStore.setState({ isSidebarOpen: false, activeLink: null });
    UseInspirationStore.setState({
      activeItem: null,
      activeIcon: null,
      activeTitle: null,
      activeQuote: undefined,
      hoveredItem: null,
    });
  });

  it("selects the sidebar item that matches the current route", () => {
    renderWithProviders(<InspirationSideComp />, {
      route: "/explore/photographers",
    });

    expect(screen.getByText("Khám phá")).toBeInTheDocument();
    expect(UseInspirationStore.getState()).toMatchObject({
      activeItem: 4,
      activeTitle: "Nhiếp ảnh gia",
      activeQuote:
        "Theo dõi các nhiếp ảnh gia nổi tiếng để cập nhật các bức ảnh mới nhất của họ",
    });
  });

  it("updates the active inspiration item when the visitor clicks another section", async () => {
    renderWithProviders(<InspirationSideComp />, { route: "/elsewhere" });

    await userEvent.click(screen.getByText("Cửa hàng ảnh"));

    expect(UseInspirationStore.getState()).toMatchObject({
      activeItem: 6,
      activeTitle: "Cửa hàng ảnh",
      activeQuote: "Những bức ảnh đang được đăng bán",
    });
    expect(UseSidebarStore.getState()).toMatchObject({
      activeLink: 6,
      isSidebarOpen: true,
    });
  });

  it("lists the photoshoot packages only while booking is on", () => {
    const { unmount } = renderWithProviders(<InspirationSideComp />, { route: "/explore" });
    expect(screen.getByText("Các gói chụp ảnh")).toBeInTheDocument();
    unmount();

    renderWithProviders(<InspirationSideComp />, {
      route: "/explore",
      featureFlags: { booking: false },
    });
    expect(screen.queryByText("Các gói chụp ảnh")).not.toBeInTheDocument();
    expect(screen.getByText("Cửa hàng ảnh")).toBeInTheDocument();
  });
});
