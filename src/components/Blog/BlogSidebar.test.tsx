import { render } from "@testing-library/react";
import Sidebar from "../Sidebar/Sidebar";
import BlogSideItem from "./BlogSideItem";
import BlogSidebar from "./BlogSidebar";

vi.mock("../Sidebar/Sidebar", () => ({
  default: vi.fn(() => <div>sidebar</div>),
}));

describe("BlogSidebar", () => {
  it("renders the sidebar with the blog header", () => {
    const handleClick = vi.fn();
    render(
      <BlogSidebar
        sideItems={BlogSideItem}
        trendItems={["trend"]}
        handleClick={handleClick}
        activeItem="B2"
        userData={{ name: "Minh" }}
      />,
    );

    expect(vi.mocked(Sidebar).mock.calls[0][0]).toEqual({
      sideItems: BlogSideItem,
      trendItems: ["trend"],
      handleClick,
      activeItem: "B2",
      isImg: false,
      isUpload: false,
      isBlog: true,
    });
  });
});
