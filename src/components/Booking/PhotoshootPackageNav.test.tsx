import { render, screen } from "@testing-library/react";
import PhotoshootPackageNav from "./PhotoshootPackageNav";

describe("PhotoshootPackageNav", () => {
  it("shows the active icon and title", () => {
    render(
      <PhotoshootPackageNav
        activeIcon={<span>icon</span>}
        activeTitle="Gói chụp"
        activeQuote="unused"
        toggleSidebar={vi.fn()}
      />,
    );

    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.getByText("Gói chụp")).toBeInTheDocument();
    expect(screen.queryByText("unused")).toBeNull();
  });

  it("falls back to # without an icon", () => {
    render(<PhotoshootPackageNav />);

    expect(screen.getByText("#")).toBeInTheDocument();
  });
});
