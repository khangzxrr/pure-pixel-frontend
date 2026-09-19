import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SideItem, SideItemClickHandler } from "../Sidebar/Sidebar";
import UploadSidebar from "./UploadSidebar";

type StubProps = {
  sideItems: SideItem[];
  handleClick: SideItemClickHandler;
  activeItem?: unknown;
  trendItems?: unknown;
  isUpload?: boolean;
};

vi.mock("../Sidebar/Sidebar", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ sideItems, handleClick, activeItem, isUpload }: StubProps) =>
      createElement(
        "div",
        null,
        createElement("span", null, `active: ${String(activeItem)}`),
        createElement("span", null, `upload: ${String(isUpload)}`),
        sideItems.map((item) =>
          createElement(
            "button",
            {
              key: item.id,
              type: "button",
              onClick: () =>
                handleClick(item.id, item.title, item.icon, item.quote),
            },
            item.title,
          ),
        ),
      ),
  };
});

describe("UploadSidebar", () => {
  it("renders the sidebar in upload mode and forwards clicks", async () => {
    const handleClick = vi.fn();
    const items: SideItem[] = [
      { id: "U1", title: "Tải ảnh lên", link: "/upload/public", quote: "" },
    ];
    render(
      <UploadSidebar
        sideItems={items}
        handleClick={handleClick}
        activeItem="U1"
        trendItems={[]}
      />,
    );

    expect(screen.getByText("active: U1")).toBeInTheDocument();
    expect(screen.getByText("upload: true")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tải ảnh lên" }));

    expect(handleClick).toHaveBeenCalledWith("U1", "Tải ảnh lên", undefined, "");
  });
});
