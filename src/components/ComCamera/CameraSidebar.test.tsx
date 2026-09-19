import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CameraSidebar from "./CameraSidebar";

type SidebarStubProps = {
  sideItems: { id: string; title: string }[];
  activeItem?: unknown;
  isCamera?: boolean;
};

vi.mock("../Sidebar/Sidebar", () => ({
  default: ({ sideItems, activeItem, isCamera }: SidebarStubProps) => (
    <div>
      <p data-testid="items">{sideItems.map((i) => i.title).join(",")}</p>
      <p data-testid="active">{String(activeItem)}</p>
      <p data-testid="is-camera">{String(isCamera)}</p>
    </div>
  ),
}));

describe("CameraSidebar", () => {
  it("renders Sidebar as a camera sidebar with the given items", () => {
    renderWithProviders(
      <CameraSidebar
        sideItems={[{ id: "C1", title: "Danh sách máy ảnh", link: "/camera/all" }]}
        activeItem="C1"
        handleClick={vi.fn()}
      />,
    );

    expect(screen.getByTestId("items")).toHaveTextContent("Danh sách máy ảnh");
    expect(screen.getByTestId("active")).toHaveTextContent("C1");
    expect(screen.getByTestId("is-camera")).toHaveTextContent("true");
  });
});
