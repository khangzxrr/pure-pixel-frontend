import { render, screen } from "@testing-library/react";
import Sidebar, { type SideItem } from "../Sidebar/Sidebar";
import SideBar from "./SideBar";

vi.mock("../Sidebar/Sidebar", () => ({
  default: vi.fn(() => <div>sidebar</div>),
}));

const items: SideItem[] = [
  { id: 1, title: "Cảm hứng", link: "/explore/inspiration" },
];

describe("SideBar", () => {
  it("renders the sidebar with the explore header", () => {
    const handleClick = vi.fn();
    render(
      <SideBar
        sideItems={items}
        trendItems={[]}
        handleClick={handleClick}
        activeItem={1}
        isFilterInspiration
      />,
    );

    expect(screen.getByText("sidebar")).toBeInTheDocument();
    expect(vi.mocked(Sidebar).mock.calls[0][0]).toEqual({
      sideItems: items,
      trendItems: [],
      handleClick,
      activeItem: 1,
      isImg: true,
      isFilterInspiration: true,
    });
  });
});
