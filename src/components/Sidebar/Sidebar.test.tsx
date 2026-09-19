import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseSidebarStore from "../../states/UseSidebarStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import Sidebar, { type SideItem } from "./Sidebar";

vi.mock("../Explore/PhotoTagsTrend", () => ({
  default: () => <div>tags trend</div>,
}));

vi.mock("./../Inspiration/InspirationPhoto/InsPhotoFilter", () => ({
  default: () => <div>photo filter</div>,
}));

const photosIcon = <span>photos icon</span>;

const items: SideItem<string>[] = [
  {
    id: "photos",
    title: "Ảnh của tôi",
    icon: photosIcon,
    link: "/profile/photos",
    quote: "quote",
  },
  { id: "wallet", title: "Ví", link: "/profile/wallet" },
];

const linkOf = (title: string) => screen.getByText(title).closest("a");

describe("Sidebar", () => {
  beforeEach(() => {
    UseSidebarStore.setState({ isSidebarOpen: false, activeLink: null });
    UseUserOtherStore.setState({ nameUserOther: "" });
  });

  it("activates the item matching the current page", () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Sidebar sideItems={items} handleClick={handleClick} />,
      { route: "/profile/photos" },
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      "photos",
      "Ảnh của tôi",
      photosIcon,
      "quote",
    );
    expect(UseSidebarStore.getState().activeLink).toBe("photos");
    expect(linkOf("Ảnh của tôi")).toHaveClass("bg-gray-500");
    expect(linkOf("Ví")).toHaveClass("hover:bg-gray-700");
  });

  it("leaves the selection alone on other pages", () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Sidebar sideItems={items} handleClick={handleClick} />,
      { route: "/elsewhere" },
    );

    expect(handleClick).not.toHaveBeenCalled();
    expect(UseSidebarStore.getState().activeLink).toBeNull();
    expect(screen.queryByText("tags trend")).toBeNull();
    expect(screen.queryByText("photo filter")).toBeNull();
  });

  it("does not re-select an item that is already active", () => {
    UseSidebarStore.setState({ activeLink: "photos" });
    const handleClick = vi.fn();
    renderWithProviders(
      <Sidebar sideItems={items} handleClick={handleClick} />,
      { route: "/profile/photos" },
    );

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("highlights an item whose link is the active link", () => {
    UseSidebarStore.setState({ activeLink: "/profile/wallet" });
    renderWithProviders(<Sidebar sideItems={items} handleClick={vi.fn()} />, {
      route: "/elsewhere",
    });

    expect(linkOf("Ví")).toHaveClass("bg-gray-500");
  });

  it("selects an item on click and toggles the sidebar", async () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Sidebar sideItems={items} handleClick={handleClick} />,
      { route: "/elsewhere" },
    );

    await userEvent.click(screen.getByText("Ví"));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith("wallet", "Ví", undefined, undefined);
    expect(UseSidebarStore.getState()).toMatchObject({
      activeLink: "wallet",
      isSidebarOpen: true,
    });
    expect(linkOf("Ví")).toHaveAttribute("href", "/profile/wallet");
  });

  it("shows the photo filters and trending tags on the inspiration page", () => {
    renderWithProviders(<Sidebar sideItems={[]} handleClick={vi.fn()} />, {
      route: "/explore/inspiration",
    });

    expect(screen.getByText("Bộ lọc ảnh")).toBeInTheDocument();
    expect(screen.getByText("photo filter")).toBeInTheDocument();
    expect(screen.getByText("CÁC THẺ THỊNH HÀNH HIỆN TẠI")).toBeInTheDocument();
    expect(screen.getByText("tags trend")).toBeInTheDocument();
  });

  describe("headers", () => {
    it("shows the user name, or User", () => {
      const { unmount } = renderWithProviders(
        <Sidebar sideItems={[]} handleClick={vi.fn()} isUser nameUser="Minh" />,
      );
      expect(screen.getByText("Minh")).toBeInTheDocument();
      unmount();

      renderWithProviders(
        <Sidebar sideItems={[]} handleClick={vi.fn()} isUser />,
      );
      expect(screen.getByText("User")).toBeInTheDocument();
    });

    it("shows the other profile name, or Hồ sơ", () => {
      const { unmount } = renderWithProviders(
        <Sidebar sideItems={[]} handleClick={vi.fn()} isOtherProfile />,
      );
      expect(screen.getByText("Hồ sơ")).toBeInTheDocument();
      unmount();

      UseUserOtherStore.setState({ nameUserOther: "Trung" });
      renderWithProviders(
        <Sidebar sideItems={[]} handleClick={vi.fn()} isOtherProfile />,
      );
      expect(screen.getByText("Trung")).toBeInTheDocument();
    });

    it.each([
      ["isImg", "Khám phá"],
      ["isUpload", "Tải lên"],
      ["isBlog", "Trang chủ"],
      ["isCamera", "Máy ảnh"],
    ] as const)("%s shows %s", (flag, title) => {
      renderWithProviders(
        <Sidebar sideItems={[]} handleClick={vi.fn()} {...{ [flag]: true }} />,
      );
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it("shows no header by default", () => {
      renderWithProviders(<Sidebar sideItems={[]} handleClick={vi.fn()} />);
      for (const title of ["User", "Khám phá", "Tải lên", "Trang chủ", "Máy ảnh", "Hồ sơ"]) {
        expect(screen.queryByText(title)).toBeNull();
      }
    });

    it.each(["isUser", "isImg", "isUpload", "isOtherProfile"] as const)(
      "%s header closes an open sidebar",
      async (flag) => {
        UseSidebarStore.setState({ isSidebarOpen: true });
        const { container } = renderWithProviders(
          <Sidebar sideItems={[]} handleClick={vi.fn()} {...{ [flag]: true }} />,
        );

        const close = container.querySelector(".cursor-pointer.mr-1");
        expect(close).not.toBeNull();
        await userEvent.click(close as HTMLElement);

        expect(UseSidebarStore.getState().isSidebarOpen).toBe(false);
        expect(container.querySelector(".cursor-pointer.mr-1")).toBeNull();
      },
    );
  });
});
